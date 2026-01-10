const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = [];
let gameState = {
  turn: 0,
  log: []
};

io.on("connection", (socket) => {
  console.log("接続:", socket.id);

  players.push(socket.id);

  io.emit("sync", { players, gameState });

  socket.on("action", (msg) => {
    gameState.log.push(msg);
    gameState.turn = (gameState.turn + 1) % players.length;
    io.emit("sync", { players, gameState });
  });

  socket.on("disconnect", () => {
    players = players.filter(id => id !== socket.id);
    io.emit("sync", { players, gameState });
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
