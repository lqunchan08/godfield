const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

// 🎴 カード100種（確率寄せ・効果は安定重視）
const CARD_POOL = [
  ...Array(40).fill({ type: "attack", power: 10 }),
  ...Array(25).fill({ type: "heal", power: 8 }),
  ...Array(20).fill({ type: "guard", power: 6 }),
  ...Array(15).fill({ type: "special", power: 15 }) // 不思議な力枠
];

const drawCard = () =>
  JSON.parse(JSON.stringify(
    CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)]
  ));

io.on("connection", socket => {

  socket.on("join", room => {
    socket.join(room);
    if (!rooms[room]) {
      rooms[room] = { players: [], turn: 0, effect: null };
    }

    rooms[room].players.push({
      id: socket.id,
      hp: 100,
      card: null
    });

    io.to(room).emit("state", rooms[room]);
  });

  socket.on("draw", room => {
    const r = rooms[room];
    if (!r) return;
    if (r.players[r.turn].id !== socket.id) return;

    const p = r.players.find(p => p.id === socket.id);
    p.card = drawCard();
    io.to(room).emit("state", r);
  });

  socket.on("use", ({ room, targetId }) => {
    const r = rooms[room];
    if (!r) return;

    const me = r.players[r.turn];
    if (me.id !== socket.id || !me.card) return;

    const target = r.players.find(p => p.id === targetId);
    if (!target) return;

    // 効果処理
    if (me.card.type === "attack") {
      target.hp -= me.card.power;
      r.effect = "shake";
    }

    if (me.card.type === "heal") {
      me.hp += me.card.power;
      r.effect = "flash";
    }

    if (me.card.type === "guard") {
      me.hp += me.card.power;
    }

    if (me.card.type === "special") {
      target.hp -= me.card.power;
      r.effect = "flash";
    }

    me.card = null;
    r.turn = (r.turn + 1) % r.players.length;

    io.to(room).emit("state", r);
    r.effect = null;
  });
});

server.listen(3000, () =>
  console.log("Server running http://localhost:3000")
);
