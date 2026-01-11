import express from "express";
import http from "http";
import { Server } from "socket.io";
import { drawCard } from "./cards.js";
import { applyCard } from "./cardEffects.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const game = {
  players: [],
  turn: 0,
  effect: null,
};

io.on("connection", socket => {
  socket.on("join", () => {
    if (game.players.find(p => p.id === socket.id)) return;

    game.players.push({
      id: socket.id,
      hp: 100,
      card: drawCard(),
      alive: true,
      status: {}
    });
    io.emit("state", game);
  });

  socket.on("play", targetId => {
    const me = game.players[game.turn];
    if (!me || me.id !== socket.id) return;

    const target = game.players.find(p => p.id === targetId);
    if (!target) return;

    applyCard(me.card, me, target, game);
    me.card = drawCard();

    game.turn = (game.turn + 1) % game.players.length;
    io.emit("state", game);
  });

  socket.on("disconnect", () => {
    game.players = game.players.filter(p => p.id !== socket.id);
    io.emit("state", game);
  });
});

server.listen(3000, () => {
  console.log("http://localhost:3000");
});
