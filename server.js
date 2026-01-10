const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

const CARD_POOL = [
  { name: "攻撃 +3", type: "attack", value: 3 },
  { name: "攻撃 +5", type: "attack", value: 5 },
  { name: "回復 +4", type: "heal", value: 4 },
  { name: "防御 +3", type: "guard", value: 3 }
];

function drawCard() {
  return CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)];
}

io.on("connection", (socket) => {

  socket.on("join", ({ room, name }) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        turn: 0,
        log: [],
        started: false
      };
    }

    rooms[room].players.push({
      id: socket.id,
      name,
      hp: 20,
      guard: 0,
      card: null,
      alive: true
    });

    io.to(room).emit("sync", rooms[room]);
  });

  socket.on("start", (room) => {
    const game = rooms[room];
    if (!game || game.started) return;

    game.started = true;
    game.log.push("🔥 ゲーム開始！");

    game.players.forEach(p => p.card = drawCard());

    io.to(room).emit("sync", game);
  });

  socket.on("useCard", (room) => {
    const game = rooms[room];
    if (!game) return;

    const player = game.players[game.turn];
    if (!player.alive) return;

    const card = player.card;
    const targets = game.players.filter(p => p.alive && p.id !== player.id);
    const target = targets[0];

    if (card.type === "attack" && target) {
      const dmg = Math.max(0, card.value - target.guard);
      target.hp -= dmg;
      target.guard = 0;
      game.log.push(`💥 ${player.name} の攻撃！ ${target.name} に ${dmg} ダメージ`);

      if (target.hp <= 0) {
        target.alive = false;
        game.log.push(`☠ ${target.name} 脱落`);
      }
    }

    if (card.type === "heal") {
      player.hp += card.value;
      game.log.push(`✨ ${player.name} 回復 +${card.value}`);
    }

    if (card.type === "guard") {
      player.guard += card.value;
      game.log.push(`🛡 ${player.name} 防御 +${card.value}`);
    }

    // 勝敗判定
    const alivePlayers = game.players.filter(p => p.alive);
    if (alivePlayers.length === 1) {
      game.log.push(`🏆 勝者：${alivePlayers[0].name}`);
      io.to(room).emit("sync", game);
      return;
    }

    // 次のターン
    do {
      game.turn = (game.turn + 1) % game.players.length;
    } while (!game.players[game.turn].alive);

    game.players[game.turn].card = drawCard();
    io.to(room).emit("sync", game);
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      rooms[room].players = rooms[room].players.filter(p => p.id !== socket.id);
      io.to(room).emit("sync", rooms[room]);
    }
  });
});

server.listen(process.env.PORT || 10000);
