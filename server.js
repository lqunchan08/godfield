const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {
  socket.on("join", ({ room, name }) => {
    socket.join(room);

    if (!rooms[room]) rooms[room] = [];
    rooms[room].push({ id: socket.id, name, hp: 100 });

    io.to(room).emit("update", rooms[room]);
  });

  socket.on("attack", (room) => {
    const players = rooms[room];
    if (!players || players.length < 2) return;

    const target = players.find(p => p.id !== socket.id);
    if (!target) return;

    target.hp -= 10;
    io.to(room).emit("log", `${target.name} に10ダメージ！`);
    io.to(room).emit("update", players);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log("起動：http://localhost:" + PORT);
});
