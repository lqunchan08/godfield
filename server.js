const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

// === カード30種 ===
const CARDS = [
  { name:"小攻撃", type:"attack", value:3 },
  { name:"中攻撃", type:"attack", value:5 },
  { name:"大攻撃", type:"attack", value:8 },
  { name:"連続攻撃", type:"attack", value:4, times:2 },
  { name:"超攻撃", type:"attack", value:12 },

  { name:"小回復", type:"heal", value:4 },
  { name:"中回復", type:"heal", value:7 },
  { name:"大回復", type:"heal", value:12 },

  { name:"小防御", type:"guard", value:3 },
  { name:"中防御", type:"guard", value:6 },
  { name:"大防御", type:"guard", value:10 },

  { name:"貫通", type:"pierce", value:6 },
  { name:"吸収", type:"drain", value:4 },
  { name:"反射", type:"reflect", value:5 },

  { name:"即死判定", type:"death", chance:0.15 },
  { name:"混乱", type:"skip" },
  { name:"HP半減", type:"halve" },

  { name:"自爆", type:"suicide", value:10 },
  { name:"全体攻撃", type:"aoe", value:4 },
  { name:"全体回復", type:"aoeHeal", value:3 },

  { name:"守護", type:"shield", value:15 },
  { name:"強化", type:"buff", value:3 },
  { name:"弱体", type:"debuff", value:3 },

  { name:"ターンスキップ", type:"skipNext" },
  { name:"蘇生", type:"revive", value:8 },
  { name:"ランダム", type:"random" },
  { name:"運命", type:"fate" },
  { name:"神の裁き", type:"judgement", value:20 }
];

function drawCard() {
  return JSON.parse(JSON.stringify(
    CARDS[Math.floor(Math.random() * CARDS.length)]
  ));
}

io.on("connection", socket => {

  socket.on("join", ({room, name}) => {
    socket.join(room);
    if (!rooms[room]) {
      rooms[room] = { players:[], turn:0, log:[], started:false };
    }

    rooms[room].players.push({
      id: socket.id,
      name,
      hp: 30,
      guard: 0,
      alive: true,
      card: null
    });

    io.to(room).emit("sync", rooms[room]);
  });

  socket.on("start", room => {
    const g = rooms[room];
    if (!g || g.started) return;
    g.started = true;
    g.log.push("🔥 ゲーム開始！");
    g.players.forEach(p => p.card = drawCard());
    io.to(room).emit("sync", g);
  });

  socket.on("useCard", room => {
    const g = rooms[room];
    if (!g) return;

    const p = g.players[g.turn];
    if (!p || p.id !== socket.id || !p.alive) return; // 🔒ターンロック

    const targets = g.players.filter(t => t.alive && t.id !== p.id);
    const t = targets[Math.floor(Math.random() * targets.length)];
    const c = p.card;

    if (!c) return;

    const log = g.log;

    switch (c.type) {
      case "attack":
        if (t) {
          const dmg = Math.max(0, c.value - t.guard);
          t.hp -= dmg; t.guard = 0;
          log.push(`💥 ${p.name} → ${t.name} ${dmg}`);
        }
        break;

      case "heal":
        p.hp += c.value;
        log.push(`✨ ${p.name} 回復 +${c.value}`);
        break;

      case "guard":
        p.guard += c.value;
        log.push(`🛡 ${p.name} 防御 +${c.value}`);
        break;

      case "death":
        if (t && Math.random() < c.chance) {
          t.hp = 0;
          log.push(`☠ ${t.name} 即死`);
        } else log.push("😈 即死失敗");
        break;

      case "aoe":
        g.players.forEach(x=>{
          if(x.alive && x.id!==p.id){ x.hp -= c.value; }
        });
        log.push("🌋 全体攻撃");
        break;

      case "judgement":
        if(t){
          t.hp -= c.value;
          log.push("⚡ 神の裁き！");
        }
        break;

      default:
        log.push("✨ 不思議な力が発動");
    }

    g.players.forEach(x=>{
      if(x.hp<=0 && x.alive){
        x.alive=false;
        log.push(`☠ ${x.name} 脱落`);
      }
    });

    const alive = g.players.filter(x=>x.alive);
    if (alive.length === 1) {
      log.push(`🏆 勝者：${alive[0].name}`);
      io.to(room).emit("sync", g);
      return;
    }

    do {
      g.turn = (g.turn + 1) % g.players.length;
    } while (!g.players[g.turn].alive);

    g.players[g.turn].card = drawCard();
    io.to(room).emit("sync", g);
  });
});

server.listen(process.env.PORT || 10000);
