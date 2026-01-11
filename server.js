const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};
let started = false;

io.on("connection", (socket) => {

  socket.on("join", (name) => {
    if (players[socket.id]) return;

    players[socket.id] = {
      id: socket.id,
      name,
      hp: 100,
      maxHp: 200,
      hand: Array.from({ length: 10 }, () => ({
        type: "ATTACK",
        power: 10
      }))
    };

    io.emit("state", { players, started });
  });

  socket.on("start", () => {
    if (Object.keys(players).length < 2) return;
    started = true;
    io.emit("started");
  });

  socket.on("play", (index) => {
    if (!started) return;
    const me = players[socket.id];
    if (!me || !me.hand[index]) return;

    const targets = Object.values(players).filter(p => p.id !== socket.id);
    if (targets.length === 0) return;

    targets[0].hp = Math.max(0, targets[0].hp - me.hand[index].power);
    me.hand.splice(index, 1);

    io.emit("state", { players, started });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("state", { players, started });
  });

});

server.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
