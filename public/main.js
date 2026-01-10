const socket = io();
let room = "";

function join() {
  const name = document.getElementById("name").value;
  room = document.getElementById("room").value;

  socket.emit("join", { room, name });
  document.getElementById("join").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
}

function startGame() {
  socket.emit("start", room);
}

function useCard() {
  socket.emit("useCard", room);
}

socket.on("sync", game => {
  document.getElementById("players").innerHTML = "";
  document.getElementById("log").innerHTML = "";

  game.players.forEach((p, i) => {
    const d = document.createElement("div");
    d.innerText = `${i === game.turn ? "▶ " : ""}${p.name} HP:${p.hp} 🛡${p.guard} ${p.alive ? "" : "☠"}`;
    document.getElementById("players").appendChild(d);
  });

  const me = game.players[game.turn];
  document.getElementById("turn").innerText = `ターン: ${me?.name}`;
  document.getElementById("card").innerText = me?.card ? `🃏 ${me.card.name}` : "";

  game.log.slice(-6).forEach(l => {
    const li = document.createElement("li");
    li.innerText = l;
    document.getElementById("log").appendChild(li);
  });
});
