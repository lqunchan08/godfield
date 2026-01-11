const socket = io();
const room = new URLSearchParams(location.search).get("room") || "default";

const joinBtn = document.getElementById("joinBtn");
const drawBtn = document.getElementById("drawBtn");
const useBtn = document.getElementById("useBtn");
const status = document.getElementById("status");
const cardImg = document.getElementById("cardImg");
const cardText = document.getElementById("cardText");
const targets = document.getElementById("targets");
const game = document.getElementById("game");

let selectedTarget = null;

joinBtn.onclick = () => socket.emit("join", room);
drawBtn.onclick = () => socket.emit("draw", room);
useBtn.onclick = () => {
  if (selectedTarget) {
    socket.emit("use", { room, targetId: selectedTarget });
  }
};

socket.on("state", state => {
  const me = state.players.find(p => p.id === socket.id);
  if (!me) return;

  // ターン表示
  status.innerText =
    `HP: ${me.hp}\n` +
    (state.players[state.turn].id === socket.id
      ? "あなたのターン"
      : "相手のターン");

  drawBtn.disabled = state.players[state.turn].id !== socket.id;
  useBtn.disabled = !me.card || drawBtn.disabled;

  // カード表示
  if (me.card) {
    cardImg.src = `cards/${me.card.type}.png`;
    cardText.innerText = me.card.type;
  } else {
    cardImg.src = "";
    cardText.innerText = "";
  }

  // 🎯 攻撃対象選択
  targets.innerHTML = "";
  state.players.forEach(p => {
    if (p.id === me.id) return;
    const btn = document.createElement("button");
    btn.innerText = `HP:${p.hp}`;
    btn.onclick = () => selectedTarget = p.id;
    targets.appendChild(btn);
  });

  // 💥 エフェクト
  if (state.effect === "shake") {
    game.classList.add("shake");
    setTimeout(() => game.classList.remove("shake"), 300);
  }
  if (state.effect === "flash") {
    game.classList.add("flash");
    setTimeout(() => game.classList.remove("flash"), 300);
  }
});
