const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);


app.use(express.static("public"));


let players = [];
let started = false;
let turn = 0;


function dealCards() {
const deck = [
{ name: "attack", power: 10 },
{ name: "heal", power: 10 },
{ name: "guard", power: 0 },
];
players.forEach(p => {
p.hand = [];
for (let i = 0; i < 10; i++) {
const c = deck[Math.floor(Math.random()*deck.length)];
p.hand.push(c);
}
});
}


io.on("connection", socket => {
socket.on("join", () => {
if (players.find(p => p.id === socket.id)) return;
players.push({ id: socket.id, hp: 100, hand: [] });
io.emit("state", { players, started, turn });
});


socket.on("start", () => {
if (players.length < 2 || started) return;
started = true;
turn = 0;
dealCards();
io.emit("startGame");
io.emit("state", { players, started, turn });
});


socket.on("disconnect", () => {
players = players.filter(p => p.id !== socket.id);
started = false;
io.emit("state", { players, started, turn });
});
});


http.listen(process.env.PORT || 3000);