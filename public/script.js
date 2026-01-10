const socket = io();
let roomId = "";

const sounds = {
  attack: new Audio("sounds/attack.mp3"),
  heal: new Audio("sounds/heal.mp3"),
  mystery: new Audio("sounds/mystery.mp3")
};

document.getElementById("join").onclick = () => {
  roomId = room.value;
  socket.emit("join", roomId);
};

document.getElementById("draw").onclick = () => {
  socket.emit("draw", roomId);
};

socket.on("state", state => {
  const me = state.players.find(p => p.id === socket.id);
  document.getElementById("turn").innerText =
    `ターン：${state.players[state.turn]?.id === socket.id ? "あなた" : "相手"}`;

  const img = document.getElementById("cardImg");
  if (me?.card) {
    img.src = `cards/${me.card.type}.png`;
    sounds[me.card.type]?.play();
  } else img.src = "";

  const players = document.getElementById("players");
  players.innerHTML = "";

  state.players.forEach(p => {
    const b = document.createElement("button");
    b.innerText = `HP:${p.hp}`;
    b.disabled = !me?.card || state.players[state.turn].id !== socket.id;
    b.onclick = () =>
      socket.emit("use", { roomId, targetId: p.id });
    players.appendChild(b);
  });

  document.body.classList.add("flash");
  setTimeout(() => document.body.classList.remove("flash"), 300);

  document.getElementById("log").innerHTML =
    state.log.slice(-5).join("<br>");
});
