const canvas = document.getElementById("drawing-canvas");
const ctx = canvas.getContext("2d");
const titleEl = document.getElementById("draw-title");
const timeEl = document.getElementById("time");

const params = new URLSearchParams(window.location.search);
const roomId = params.get("roomId");
const playerName = localStorage.getItem("playerName") || "Guest";

let drawing = false;
let brushSize = 8;
let brushColor = "#000000";
let mode = "brush";

function resizeCanvas() {
    const wrap = document.querySelector(".canvas-wrap");
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = Math.min(800, wrap.clientWidth);
    const cssHeight = Math.round(cssWidth * 0.66);
    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    ctx.scale(dpr, dpr);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ---------- Pokémon et tour ----------
async function getRoomData() {
    const res = await fetch('rooms.php?action=list');
    const rooms = await res.json();
    const room = rooms.find(r => r.id === roomId);
    if (!room) { alert("Salon introuvable"); window.location.href="../createPartyGame/createGame.html"; return null; }
    return room;
}

async function initPokemon() {
    const room = await getRoomData();
    if (!room) return;

    let pokemonId = room.pokemonId;
    let pokemonNameFr = room.pokemonNameFr;

    if (!pokemonId || !pokemonNameFr) {
        const max = 898;
        const randomId = Math.floor(Math.random()*max)+1;

        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const data = await res.json();
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${randomId}`);
        const speciesData = await speciesRes.json();
        const frName = speciesData.names.find(n => n.language.name==="fr").name;

        pokemonId = randomId;
        pokemonNameFr = frName;

        const formData = new URLSearchParams();
        formData.append("id", roomId);
        formData.append("pokemonId", pokemonId);
        formData.append("pokemonNameFr", pokemonNameFr);
        await fetch("rooms.php?action=setPokemon",{method:"POST",body:formData});
    }

    const isTurn = room.players[0]?.name === playerName;

    titleEl.textContent = isTurn ? `Dessine ${pokemonNameFr}` : `En attente… ${pokemonNameFr}`;
    localStorage.setItem("pokemonId", pokemonId);
    localStorage.setItem("pokemonNameFr", pokemonNameFr);
}

initPokemon();

// ---------- palette & pinceaux ----------
document.getElementById("palette").addEventListener("click", (e)=>{
    const btn = e.target.closest(".swatch"); if(!btn) return;
    brushColor = btn.dataset.color; mode="brush";
});
document.getElementById("color-picker").addEventListener("input",(e)=>{ brushColor=e.target.value; mode="brush"; });
document.getElementById("brush-sizes").addEventListener("click",(e)=>{
    const b = e.target.closest(".brush"); if(!b) return;
    brushSize=parseInt(b.dataset.size,10); mode="brush";
    document.querySelectorAll(".brush").forEach(btn=>btn.classList.remove("active"));
    b.classList.add("active");
});
document.querySelector('.brush[data-size="8"]').classList.add("active");
document.getElementById("bucket-btn").addEventListener("click",()=>{ mode=(mode==="bucket")?"brush":"bucket"; });
document.getElementById("eraser-btn").addEventListener("click",()=>{ mode=(mode==="eraser")?"brush":"eraser"; });
document.getElementById("clear-btn").addEventListener("click",()=>{
    const prev=ctx.fillStyle; ctx.fillStyle="#ffffff"; ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight); ctx.fillStyle=prev;
});

// fond blanc initial
ctx.fillStyle="#ffffff";
ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);
ctx.fillStyle="#000000";

// ---------- dessin ----------
function drawTo(x,y,start=false){
    ctx.lineWidth=brushSize; ctx.lineCap="round"; ctx.lineJoin="round";
    if(mode==="eraser"){ ctx.globalCompositeOperation="destination-out"; ctx.strokeStyle="rgba(0,0,0,1)"; }
    else { ctx.globalCompositeOperation="source-over"; ctx.strokeStyle=brushColor; }
    if(!start){ ctx.lineTo(x,y); ctx.stroke(); } else { ctx.lineTo(x+0.01,y+0.01); ctx.stroke(); }
    ctx.moveTo(x,y);
}
canvas.addEventListener("mousedown",e=>{
    const x=e.offsetX,y=e.offsetY;
    if(mode==="bucket"){ ctx.fillStyle=brushColor; ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight); ctx.fillStyle="#000000"; return; }
    drawing=true; ctx.beginPath(); ctx.moveTo(x,y); drawTo(x,y,true);
});
canvas.addEventListener("mousemove",e=>{ if(!drawing) return; drawTo(e.offsetX,e.offsetY); });
canvas.addEventListener("mouseup",()=>{ drawing=false; ctx.beginPath(); });
canvas.addEventListener("mouseleave",()=>{ drawing=false; ctx.beginPath(); });

canvas.addEventListener("touchstart",e=>{ e.preventDefault(); const rect=canvas.getBoundingClientRect(); const x=e.touches[0].clientX-rect.left; const y=e.touches[0].clientY-rect.top; if(mode==="bucket"){ ctx.fillStyle=brushColor; ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight); ctx.fillStyle="#000000"; return; } drawing=true; ctx.beginPath(); ctx.moveTo(x,y); drawTo(x,y,true); },{passive:false});
canvas.addEventListener("touchmove",e=>{ e.preventDefault(); if(!drawing) return; const rect=canvas.getBoundingClientRect(); const x=e.touches[0].clientX-rect.left; const y=e.touches[0].clientY-rect.top; drawTo(x,y); },{passive:false});
canvas.addEventListener("touchend",()=>{ drawing=false; ctx.beginPath(); });

// ---------- timer ----------
let timeLeft=60;
const timer=setInterval(()=>{
    timeLeft--; timeEl.textContent=timeLeft;
    if(timeLeft<=0){ clearInterval(timer); finishRound(); }
},1000);

function finishRound(){
    const drawingData = canvas.toDataURL("image/png");
    const formData = new URLSearchParams();
    formData.append("roomId", roomId);
    formData.append("player", playerName);
    formData.append("drawing", drawingData);
    fetch("rooms.php?action=submitDrawing",{method:"POST",body:formData});
    localStorage.setItem("lastDrawing",drawingData);
    window.location.href="drawFinish.html?roomId="+roomId;
}
