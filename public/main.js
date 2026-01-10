socket.on("effect",type=>{
  const body=document.body;
  if(type==="shake"){
    body.classList.add("shake");
    setTimeout(()=>body.classList.remove("shake"),500);
  }
  if(type==="explosion"){
    body.classList.add("flash");
    setTimeout(()=>body.classList.remove("flash"),300);
  }
});
