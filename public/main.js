const socket = io();
let currentRoom = "";

const joinDiv = document.getElementById("join");
const gameDiv = document.getElementById("game");
const playersDiv = document.getElementById("players");
const logUl = document.getElementById("log");
const turnH2 = document.getElementById("turn");

function join() {
  const name = document.getElementById("name").value;
  const room = document.getElementById("room").value;

  if (!name || !room) return alert("名前と部屋ID必須");

  currentRoom = room;
  socket.emit("join", { room, name });

  joinDiv.classList.add("hidden");
  gameDiv.classList.remove("hidden");
}

function attack() {
  socket.emit("attack", currentRoom);
}

socket.on("sync", (game) => {
  playersDiv.innerHTML = "";
  logUl.innerHTML = "";

  game.players.forEach((p, i) => {
    const div = document.createElement("div");
    div.innerText = `${i === game.turn ? "▶ " : ""}${p.name} HP:${p.hp}`;
    playersDiv.appendChild(div);
  });

  turnH2.innerText = `ターン: ${game.players[game.turn]?.name}`;

  game.log.slice(-5).forEach(l => {
    const li = document.createElement("li");
    li.innerText = l;
    logUl.appendChild(li);
  });
});
