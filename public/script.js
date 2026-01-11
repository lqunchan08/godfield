const socket = io();
const room = new URLSearchParams(location.search).get("room") || "default";

const joinBtn = document.getElementById("joinBtn");
const status = document.getElementById("status");
const handDiv = document.getElementById("hand");
const targets = document.getElementById("targets");
const game = document.getElementById("game");

const sounds = {
  attack: new Audio("sounds/attack.mp3"),
  heal: new Audio("sounds/heal.mp3"),
  special: new Audio("sounds/special.mp3")
};

let selectedCard = null;
let selectedTarget = null;

joinBtn.onclick = () => {
  socket.emit("join", room);
  joinBtn.style.display = "none"; // ★参加後消える
};

socket.on("state", state => {
  const me = state.players.find(p => p.id === socket.id);
  if (!me) return;

  status.innerText =
    `HP:${me.hp}\n` +
    (state.players[state.turn].id === socket.id
      ? "あなたのターン"
      : "相手のターン");

  // 手札表示
  handDiv.innerHTML = "";
  me.hand.forEach((c, i) => {
    const img = document.createElement("img");
    img.src = `cards/${c.type}.png`;
    img.onclick = () => selectedCard = i;
    handDiv.appendChild(img);
  });

  // 対象選択
  targets.innerHTML = "";
  state.players.forEach(p => {
    if (p.id === me.id) return;
    const b = document.createElement("button");
    b.innerText = `HP:${p.hp}`;
    b.onclick = () => {
      selectedTarget = p.id;
      socket.emit("use", { room, cardIndex: selectedCard, targetId: selectedTarget });
    };
    targets.appendChild(b);
  });

  // 効果音
  if (state.effect && sounds[state.effect]) {
    sounds[state.effect].play();
  }

  // 演出
  if (state.effect) {
    game.classList.add(state.effect);
    setTimeout(() => game.classList.remove(state.effect), 400);
  }
});
