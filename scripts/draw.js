// ---------- helpers ----------
const capitalize = s => s ? s[0].toUpperCase() + s.slice(1) : s;

// ---------- récup du contexte ----------
const canvas = document.getElementById("drawing-canvas");
const ctx = canvas.getContext("2d");
const titleEl = document.getElementById("draw-title");
const timeEl = document.getElementById("time");

// Taille responsive + crisp sur écrans retina
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
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ---------- état dessin ----------
let drawing = false;
let brushSize = 8;
let brushColor = "#000000";
let mode = "brush"; // brush | bucket | eraser

// ---------- Pokémon + titre (tirage aléatoire) ----------
async function getRandomPokemon() {
  const max = 898;
  const randomId = Math.floor(Math.random() * max) + 1;

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
  const data = await res.json();

  // Récup nom FR
  const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${randomId}`);
  const speciesData = await speciesRes.json();
  const frName = speciesData.names.find(n => n.language.name === "fr").name;

  return { id: randomId, enName: data.name, frName };
}

async function initPokemon() {
  let pokemonId = localStorage.getItem("pokemonId");
  let pokemonNameFr = localStorage.getItem("pokemonNameFr");

  if (!pokemonId || !pokemonNameFr) {
    const poke = await getRandomPokemon();
    pokemonId = poke.id;
    pokemonNameFr = poke.frName;

    localStorage.setItem("pokemonId", pokemonId);
    localStorage.setItem("pokemonNameFr", pokemonNameFr);
  }

  const isTurn = true; // à adapter pour multi
  localStorage.setItem("isTurn", isTurn ? "true" : "false");

  // affichage du titre
  titleEl.textContent = isTurn
    ? `Dessine ${pokemonNameFr}`
    : `En attente… ${pokemonNameFr}`;
}

initPokemon();

// ---------- palette couleurs ----------
document.getElementById("palette").addEventListener("click", (e) => {
  const btn = e.target.closest(".swatch");
  if (!btn) return;
  brushColor = btn.dataset.color;
  mode = "brush";
});

document.getElementById("color-picker").addEventListener("input", (e) => {
  brushColor = e.target.value;
  mode = "brush";
});

// ---------- tailles de pinceau ----------
document.getElementById("brush-sizes").addEventListener("click", (e) => {
  const b = e.target.closest(".brush");
  if (!b) return;
  brushSize = parseInt(b.dataset.size, 10);
  mode = "brush";
  document.querySelectorAll(".brush").forEach(btn => btn.classList.remove("active"));
  b.classList.add("active");
});
document.querySelector('.brush[data-size="8"]').classList.add("active");

// ---------- actions ----------
document.getElementById("bucket-btn").addEventListener("click", () => {
  mode = (mode === "bucket") ? "brush" : "bucket";
});
document.getElementById("eraser-btn").addEventListener("click", () => {
  mode = (mode === "eraser") ? "brush" : "eraser";
});
document.getElementById("clear-btn").addEventListener("click", () => {
  const prev = ctx.fillStyle;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.fillStyle = prev;
});

// fond blanc au départ
(function initWhiteBg(){
  const prev = ctx.fillStyle;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.fillStyle = prev;
})();

// ---------- dessin (mouse) ----------
canvas.addEventListener("mousedown", (e) => {
  const x = e.offsetX;
  const y = e.offsetY;

  if (mode === "bucket") {
    const prev = ctx.fillStyle;
    ctx.fillStyle = brushColor;
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.fillStyle = prev;
    return;
  }

  drawing = true;
  ctx.beginPath();
  ctx.moveTo(x, y);
  drawTo(x, y, true);
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  drawTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
  ctx.beginPath();
});
canvas.addEventListener("mouseleave", () => {
  drawing = false;
  ctx.beginPath();
});

// ---------- dessin (touch) ----------
function getTouchPos(t) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (t.clientX - rect.left),
    y: (t.clientY - rect.top)
  };
}
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const { x, y } = getTouchPos(e.touches[0]);
  if (mode === "bucket") {
    const prev = ctx.fillStyle;
    ctx.fillStyle = brushColor;
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.fillStyle = prev;
    return;
  }
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(x, y);
  drawTo(x, y, true);
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!drawing) return;
  const { x, y } = getTouchPos(e.touches[0]);
  drawTo(x, y);
}, { passive: false });

canvas.addEventListener("touchend", () => {
  drawing = false;
  ctx.beginPath();
});

// ---------- cœur du tracé ----------
function drawTo(x, y, start = false) {
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (mode === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = brushColor;
  }

  if (!start) {
    ctx.lineTo(x, y);
    ctx.stroke();
  } else {
    ctx.lineTo(x + 0.01, y + 0.01);
    ctx.stroke();
  }

  ctx.moveTo(x, y);
}

// ---------- timer ----------
let timeLeft = 60;
const timer = setInterval(() => {
  timeLeft--;
  timeEl.textContent = timeLeft;
  if (timeLeft <= 0) {
    clearInterval(timer);
    finishRound();
  }
}, 1000);

// ---------- Fin du round ----------
function finishRound() {
  const drawingData = canvas.toDataURL("image/png");
  localStorage.setItem("lastDrawing", drawingData);
  window.location.href = "drawFinish.html";
}
