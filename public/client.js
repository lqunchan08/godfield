const socket = io();


function join() {
const name = document.getElementById("name").value;
socket.emit("join", name);
}


function startGame() {
socket.emit("startGame");
}


socket.on("errorMsg", msg => alert(msg));


socket.on("state", state => {
document.getElementById("players").innerHTML = state.players
.map((p, i) => `${i === state.turnIndex ? "👉" : ""}${p.name} HP:${p.hp}`)
.join("<br>");


const me = state.players.find(p => p.id === socket.id);
const hand = document.getElementById("hand");
hand.innerHTML = "";


if (!me) return;


me.hand.forEach((c, i) => {
const box = document.createElement("div");
box.className = "cardBox";


const img = document.createElement("img");
img.src = `cards/${c.type}.png`;
img.className = "card";
img.onclick = () => socket.emit("play", i);


const power = document.createElement("div");
power.className = "cardPower";
power.innerText = `攻${c.power}`;


box.appendChild(img);
box.appendChild(power);
hand.appendChild(box);
});


document.getElementById("startBtn").disabled = state.players.length < 2;
});