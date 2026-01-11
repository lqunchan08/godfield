const socket = io();

const join = document.getElementById("join");
const joinBtn = document.getElementById("joinBtn");
const nameInput = document.getElementById("nameInput");
const startBtn = document.getElementById("startBtn");
const playersDiv = document.getElementById("players");
const handDiv = document.getElementById("hand");

joinBtn.onclick = () => {
  if (!nameInput.value) return;
  socket.emit("join", nameInput.value);
  join.style.display = "none";
};

startBtn.onclick = () => {
  socket.emit("start");
};

socket.on("started", () => {
  startBtn.style.display = "none";
});

socket.on("state", ({ players }) => {
  playersDiv.innerHTML = "";
  handDiv.innerHTML = "";

  Object.values(players).forEach(p => {
    const box = document.createElement("div");
    box.className = "player";

    box.innerHTML = `
      <div class="name">${p.name}</div>
      <div class="hp">HP ${p.hp} / ${p.maxHp}</div>
    `;
    playersDiv.appendChild(box);

    if (p.id === socket.id) {
      p.hand.forEach((card, i) => {
        const c = document.createElement("div");
        c.className = "card";
        c.innerHTML = `
          <div class="cardType">${card.type}</div>
          <div class="cardPower">${card.power}</div>
        `;
        c.onclick = () => socket.emit("play", i);
        handDiv.appendChild(c);
      });
    }
  });
});
