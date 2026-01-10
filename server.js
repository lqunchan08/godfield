const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

/* === 本家体感寄せ確率 === */
const CARD_POOL = [
  // 攻撃（多い）
  ...Array(18).fill({ type:"attack", min:3, max:8 }),
  // 回復
  ...Array(10).fill({ type:"heal", min:4, max:10 }),
  // 防御
  ...Array(8).fill({ type:"guard", min:3, max:10 }),
  // 特殊（少ない）
  ...Array(6).fill({ type:"special" })
];

function rand(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
}

function drawCard(){
  const base = CARD_POOL[Math.floor(Math.random()*CARD_POOL.length)];
  if(base.type==="attack") return {type:"attack", value:rand(base.min,base.max)};
  if(base.type==="heal") return {type:"heal", value:rand(base.min,base.max)};
  if(base.type==="guard") return {type:"guard", value:rand(base.min,base.max)};
  return {type:"special"};
}

io.on("connection",socket=>{
  socket.on("join",({room,name})=>{
    socket.join(room);
    if(!rooms[room]){
      rooms[room]={players:[],turn:0,log:[],started:false};
    }
    rooms[room].players.push({
      id:socket.id,name,hp:30,guard:0,alive:true,card:null
    });
    io.to(room).emit("sync",rooms[room]);
  });

  socket.on("start",room=>{
    const g=rooms[room];
    if(!g||g.started)return;
    g.started=true;
    g.log.push("🔥 ゲーム開始！");
    g.players.forEach(p=>p.card=drawCard());
    io.to(room).emit("sync",g);
  });

  socket.on("useCard",room=>{
    const g=rooms[room];
    if(!g)return;
    const p=g.players[g.turn];
    if(!p||p.id!==socket.id||!p.alive)return;

    const targets=g.players.filter(t=>t.alive&&t.id!==p.id);
    const t=targets[Math.floor(Math.random()*targets.length)];
    const c=p.card;

    if(c.type==="attack"&&t){
      const dmg=Math.max(1,c.value-t.guard);
      t.hp-=dmg; t.guard=0;
      g.log.push(`💥 ${p.name} の攻撃！ ${dmg}`);
      io.to(room).emit("effect","shake");
    }

    if(c.type==="heal"){
      p.hp+=c.value;
      g.log.push(`✨ ${p.name} 回復 +${c.value}`);
      io.to(room).emit("effect","heal");
    }

    if(c.type==="guard"){
      p.guard+=c.value;
      g.log.push(`🛡 ${p.name} 防御 +${c.value}`);
    }

    if(c.type==="special"){
      const roll=Math.random();
      if(roll<0.25&&t){
        t.hp=0;
        g.log.push(`☠ 不思議な力で ${t.name} 即死！`);
        io.to(room).emit("effect","explosion");
      }else if(roll<0.6){
        g.log.push("🌪 全員にダメージ！");
        g.players.forEach(x=>x.alive&&(x.hp-=3));
        io.to(room).emit("effect","shake");
      }else{
        g.log.push("✨ 自分が大回復！");
        p.hp+=12;
        io.to(room).emit("effect","heal");
      }
    }

    g.players.forEach(x=>{
      if(x.hp<=0&&x.alive){
        x.alive=false;
        g.log.push(`☠ ${x.name} 脱落`);
      }
    });

    const alive=g.players.filter(x=>x.alive);
    if(alive.length===1){
      g.log.push(`🏆 勝者：${alive[0].name}`);
      io.to(room).emit("sync",g);
      return;
    }

    do{ g.turn=(g.turn+1)%g.players.length }
    while(!g.players[g.turn].alive);

    g.players[g.turn].card=drawCard();
    io.to(room).emit("sync",g);
  });
});

server.listen(process.env.PORT||10000);
