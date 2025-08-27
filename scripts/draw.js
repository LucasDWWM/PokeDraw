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
  const cssWidth = Math.min(800, wrap.clientWidth); // limite pour garder proportions
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

// ---------- Pokémon + titre ----------
const params = new URLSearchParams(location.search);
const pokemonFromUrl = params.get("p");
const turnFromUrl = params.get("turn"); // "1" si c'est le tour du joueur

let pokemonName = (pokemonFromUrl || localStorage.getItem("pokemon") || "pikachu").toLowerCase();
let isTurn = (turnFromUrl === "1") || (localStorage.getItem("isTurn") === "true");

// On sauvegarde ce qui est passé par l'URL pour l'utiliser sur drawFinish
localStorage.setItem("pokemon", pokemonName);
localStorage.setItem("isTurn", isTurn ? "true" : "false");

// titre
titleEl.textContent = isTurn
  ? `Draw ${capitalize(pokemonName)}`
  : `Waiting… ${capitalize(pokemonName)}`;

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
  // active visuelle
  document.querySelectorAll(".brush").forEach(btn => btn.classList.remove("active"));
  b.classList.add("active");
});
// set default active
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
// IMPORTANT: on démarre un nouveau "path" AU CLIC pour éviter le trait qui rejoint deux zones
canvas.addEventListener("mousedown", (e) => {
  const x = e.offsetX;
  const y = e.offsetY;

  if (mode === "bucket") {
    // bucket simple: remplir tout le canvas (tu pourras remplacer par un flood-fill plus tard)
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
  // très important pour éviter de relier le prochain clic au précédent
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

// cœur du tracé
function drawTo(x, y, start = false) {
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (mode === "eraser") {
    ctx.globalCompositeOperation = "destination-out"; // gomme
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = brushColor;
  }

  if (!start) {
    ctx.lineTo(x, y);
    ctx.stroke();
  } else {
    // premier point : tracer un point si l'utilisateur clique sans bouger
    ctx.lineTo(x + 0.01, y + 0.01);
    ctx.stroke();
  }

  ctx.moveTo(x, y);
}

// ---------- timer ----------
let timeLeft = 60; // ajuste si besoin
const timer = setInterval(() => {
  timeLeft--;
  timeEl.textContent = timeLeft;
  if (timeLeft <= 0) {
    clearInterval(timer);
    finishRound();
  }
}, 1000);

// Fin du round
function finishRound() {
  // sauvegarder le dessin en base64
  const dpr = window.devicePixelRatio || 1;
  // pour toDataURL correct, on doit l'appliquer sur le canvas interne
  // mais on a déjà dessiné en coordonnées CSS (grâce au scale), donc OK
  const drawingData = canvas.toDataURL("image/png");
  localStorage.setItem("lastDrawing", drawingData);
  // on garde pokemonName déjà mis en LS plus haut
  window.location.href = "drawFinish.html";
}
