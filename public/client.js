const socket = io();


function join() {
const name = document.getElementById("name").value;
socket.emit("join", name);
document.getElementById("join").hidden = true;
document.getElementById("game").hidden = false;
}


function sendChat() {
socket.emit("chat", document.getElementById("chat").value);
}


socket.on("state", state => {
const me = state.players.find(p => p.id === socket.id);


players.innerHTML = state.players.map((p, i) =>
`<div class="player ${i === state.turn ? 'turn' : ''}">
<span style="color:${i===0?'cyan':'orange'}">${p.name}</span>
HP:${p.hp} MP:${p.mp} ￥:${p.money}
</div>`
).join("");


hand.innerHTML = me?.hand.map((c, i) =>
`<button ${state.players[state.turn].id!==socket.id?'disabled':''}
onclick="socket.emit('play',${i})">
<img src="cards/${c.type}.png"><br>${c.type}
</button>`
).join("");


log.innerHTML = state.log.slice(-6).join("<br>");
});