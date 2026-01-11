const socket = io();


const joinBtn = document.getElementById("join");
const startBtn = document.getElementById("start");
const field = document.getElementById("field");
const lobby = document.getElementById("lobby");
const msg = document.getElementById("msg");
const handDiv = document.getElementById("hand");


joinBtn.onclick = () => {
socket.emit("join");
joinBtn.style.display = "none";
};


startBtn.onclick = () => socket.emit("start");


socket.on("startGame", () => {
msg.innerText = "ゲームスタート！";
});


socket.on("state", state => {
if (state.started) {
lobby.classList.add("hidden");
field.classList.remove("hidden");
const me = state.players.find(p => p.id === socket.id);
if (!me) return;
handDiv.innerHTML = "";
me.hand.forEach((c, i) => {
const d = document.createElement("div");
d.className = "card";
d.innerHTML = `<img src="cards/${c.name}.png" width="50"><div>${c.power}</div>`;
handDiv.appendChild(d);
});
}
});