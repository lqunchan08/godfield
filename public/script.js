// ===== Socket.IO 接続 =====
const socket = io();

// ===== HTML要素取得 =====
const joinBtn = document.getElementById("joinBtn");
const attackBtn = document.getElementById("attackBtn");
const healBtn = document.getElementById("healBtn");
const logDiv = document.getElementById("log");

const hpMain = document.getElementById("hpMain");
const hpSub = document.getElementById("hpSub");

const cardImg = document.getElementById("cardImg");
const cardText = document.getElementById("cardText");

// ===== 参加 =====
joinBtn.addEventListener("click", () => {
  socket.emit("join");
});

// ===== 行動ボタン =====
attackBtn.addEventListener("click", () => {
  socket.emit("action", { type: "attack" });
});

healBtn.addEventListener("click", () => {
  socket.emit("action", { type: "heal" });
});

// ===== サーバー状態を受信 =====
socket.on("state", (state) => {
  const me = state.players.find(p => p.id === socket.id);

  if (!me) return;

  // ===== HP表示 =====
  hpMain.innerText = `メインHP: ${me.hp}`;
  hpSub.innerText = `サブHP: ${me.subHp}`;

  // ===== カード表示（←質問のコード含む） =====
  if (me.card) {
    cardImg.src = `cards/${me.card.type}.png`;
    cardText.innerText = me.card.type;
  } else {
    cardImg.src = "";
    cardText.innerText = "";
  }

  // ===== ターン制御（自分のターンだけ操作可能） =====
  const myTurn = state.turnPlayerId === socket.id;
  attackBtn.disabled = !myTurn;
  healBtn.disabled = !myTurn;

  // ===== ログ表示 =====
  logDiv.innerHTML = "";
  state.log.forEach(line => {
    const p = document.createElement("div");
    p.innerText = line;
    logDiv.appendChild(p);
  });
});
