const socket = io();

const info = document.getElementById("info");
const log = document.getElementById("log");

socket.on("sync", (data) => {
  info.innerText = `参加人数: ${data.players.length} / ターン: ${data.gameState.turn + 1}`;

  log.innerHTML = "";
  data.gameState.log.forEach(l => {
    const li = document.createElement("li");
    li.innerText = l;
    log.appendChild(li);
  });
});

function sendAction() {
  socket.emit("action", "誰かが行動した！");
}
