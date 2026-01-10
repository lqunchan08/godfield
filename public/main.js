const socket = io();
let room="", myId="";

socket.on("connect",()=>myId=socket.id);

function join(){
  room=document.getElementById("room").value;
  socket.emit("join",{room,name:document.getElementById("name").value});
  document.getElementById("join").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
}

function start(){ socket.emit("start",room); }
function useCard(){ socket.emit("useCard",room); }

socket.on("sync",g=>{
  const players=document.getElementById("players");
  const log=document.getElementById("log");
  players.innerHTML=""; log.innerHTML="";

  g.players.forEach((p,i)=>{
    const d=document.createElement("div");
    d.innerText=`${i===g.turn?"▶ ":""}${p.name} HP:${p.hp} ${p.alive?"":"☠"}`;
    players.appendChild(d);
  });

  const me=g.players[g.turn];
  document.getElementById("turn").innerText=`ターン：${me?.name}`;
  document.getElementById("card").innerText=me?.card?`🃏 ${me.card.name}`:"";

  document.getElementById("useBtn").disabled = me?.id !== myId;

  g.log.slice(-6).forEach(l=>{
    const li=document.createElement("li");
    li.innerText=l;
    log.appendChild(li);
  });
});
