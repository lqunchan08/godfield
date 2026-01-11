const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);


app.use(express.static("public"));


let state = {
players: [],
turn: 0,
log: []
};


const CARDS = [
{ type: "attack", atk: 5 },
{ type: "attack", atk: 8 },
{ type: "attack", atk: 10 },
{ type: "heal", heal: 5 },
{ type: "heal", heal: 10 },
{ type: "guard", def: 5 }
];


function drawCard() {
return CARDS[Math.floor(Math.random() * CARDS.length)];
}


io.on("connection", socket => {
socket.on("join", name => {
const player = {
id: socket.id,
name,
hp: 100,
maxHp: 200,
mp: 20,
money: 20,
hand: Array.from({ length: 8 }, drawCard)
};
state.players.push(player);
io.emit("state", state);
});


socket.on("play", cardIndex => {
const me = state.players[state.turn];
if (!me || me.id !== socket.id) return;


const card = me.hand.splice(cardIndex, 1)[0];
const target = state.players[(state.turn + 1) % state.players.length];


if (card.atk) {
target.hp = Math.max(0, target.hp - card.atk);
state.log.push(`${me.name} の攻撃！ ${card.atk} ダメージ`);
}
if (card.heal) {
me.hp = Math.min(me.maxHp, me.hp + card.heal);
state.log.push(`${me.name} は ${card.heal} 回復`);
}


me.hand.push(drawCard());
state.turn = (state.turn + 1) % state.players.length;
io.emit("state", state);
});


socket.on("chat", msg => {
state.log.push(msg);
io.emit("state", state);
});
});


http.listen(3000);