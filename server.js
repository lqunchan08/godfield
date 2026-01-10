const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

// 🎴 カード100種対応テンプレ
const CARDS = [
  { type: "attack", power: 10, rate: 20 },
  { type: "attack", power: 20, rate: 10 },
  { type: "attack", power: 30, rate: 5 },

  { type: "heal", power: 10, rate: 15 },
  { type: "heal", power: 20, rate: 10 },

  { type: "guard", power: 10, rate: 15 },
  { type: "guard", power: 20, rate: 10 },

  { type: "mystery", rate: 15 }

  // 👇 ここに増やすだけで100種完成
];

function drawCard() {
  const total = CARDS.reduce((s, c) => s + c.rate, 0);
  let r = Math.random() * total;
  for (const c of CARDS) {
    r -= c.rate;
    if (r <= 0) return { ...c };
  }
}

io.on("connection", socket => {

  socket.on("join", roomId => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { players: [], turn: 0, log: [] };
    }

    rooms[roomId].players.push({
      id: socket.id,
      hp: 100,
      guard: 0,
      card: null
    });

    io.to(roomId).emit("state", rooms[roomId]);
  });

  socket.on("draw", roomId => {
    const room = rooms[roomId];
    const p = room.players[room.turn];
    if (p.id !== socket.id) return;

    p.card = drawCard();
    io.to(roomId).emit("state", room);
  });

  socket.on("use", ({ roomId, targetId }) => {
    const room = rooms[roomId];
    const p = room.players[room.turn];
    if (p.id !== socket.id || !p.card) return;

    const t = room.players.find(x => x.id === targetId);
    const c = p.card;

    if (c.type === "attack") {
      const dmg = Math.max(0, c.power - t.guard);
      t.hp -= dmg;
      t.guard = 0;
      room.log.push(`💥 ${dmg}ダメージ`);
    }

    if (c.type === "heal") {
      p.hp = Math.min(100, p.hp + c.power);
      room.log.push(`✨ 回復 ${c.power}`);
    }

    if (c.type === "guard") {
      p.guard += c.power;
      room.log.push(`🛡 防御 ${c.power}`);
    }

    if (c.type === "mystery") {
      const r = Math.random();
      if (r < 0.33) {
        p.hp += 30;
        room.log.push("🌈 不思議な力：超回復");
      } else if (r < 0.66) {
        t.hp -= 25;
        room.log.push("🔥 不思議な力：爆発");
      } else {
        p.guard += 30;
        room.log.push("🔮 不思議な力：結界");
      }
    }

    room.players = room.players.filter(pl => pl.hp > 0);
    room.turn = (room.turn + 1) % room.players.length;
    p.card = null;

    io.to(roomId).emit("state", room);
  });
});

server.listen(3000);
