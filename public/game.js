const socket = io();

document.getElementById("joinBtn").onclick = () => {
  socket.emit("join");
  document.getElementById("joinBtn").style.display = "none";
};

socket.on("state", state => {
  const me = state.players.find(p => p.id === socket.id);

  const img = document.getElementById("cardImg");
  const text = document.getElementById("cardText");

  if (me?.card) {
    img.src = `cards/${me.card.id}.png`;
    text.innerText = me.card.id;
  } else {
    img.src = "";
    text.innerText = "";
  }

  const players = document.getElementById("players");
  players.innerHTML = "";

  state.players.forEach(p => {
    const b = document.createElement("button");
    b.innerText = `HP ${p.hp}`;
    b.onclick = () => socket.emit("play", p.id);
    players.appendChild(b);
  });

  if (state.effect === "explosion") {
    document.body.classList.add("explosion");
    setTimeout(()=>document.body.classList.remove("explosion"),300);
  }
});
