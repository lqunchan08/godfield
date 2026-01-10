const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {

  socket.on("join", ({ room, name }) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        turn: 0,
        log: []
      };
    }

    rooms[room].players.push({
      id: socket.id,
      name,
      hp: 20
    });

    io.to(room).emit("sync", rooms[room]);
  });

  socket.on("attack", (room) => {
    const game = rooms[room];
    if (!game) return;

    const attacker = game.players[game.turn];
    const targetIndex = (game.turn + 1) % game.players.length;
    const target = game.players[targetIndex];

    target.hp -= 3;

    game.log.push(`${attacker.name} が ${target.name} を攻撃！ (-3)`);

    game.turn = (game.turn + 1) % game.players.length;

    io.to(room).emit("sync", game);
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      rooms[room].players = rooms[room].players.filter(p => p.id !== socket.id);
      io.to(room).emit("sync", rooms[room]);
    }
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
