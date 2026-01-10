const socket = io();
const room = new URLSearchParams(location.search).get("room") || "main";

function join() {
  const name = document.getElementById("name").value;
  socket.emit("join", { room, name });
}

function attack() {
  socket.emit("attack", room);
}

socket.on("update", (players) => {
  const ul = document.getElementById("players");
  ul.innerHTML = "";
  players.forEach(p => {
    ul.innerHTML += `<li>${p.name} HP:${p.hp}</li>`;
  });
});

socket.on("log", (msg) => {
  document.getElementById("log").innerHTML += `<li>${msg}</li>`;
});
