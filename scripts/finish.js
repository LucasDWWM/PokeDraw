// récupérer pokemon choisi
const pokemonId = localStorage.getItem("pokemonId");
const pokemonNameFr = localStorage.getItem("pokemonNameFr");

// fetch API pokedex
fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
  .then(res => res.json())
  .then(data => {
    // sprite avec fallback
    document.getElementById("pokemon-img").src =
      data.sprites.front_default ||
      data.sprites.other["official-artwork"].front_default ||
      "";

    // nom FR depuis localStorage
    document.getElementById("pokemon-name").textContent = pokemonNameFr;
  });

// récupérer les dessins
const userDrawings = document.getElementById("user-drawings");
const lastDrawing = localStorage.getItem("lastDrawing");

// système de points
let scores = JSON.parse(localStorage.getItem("scores")) || {};
const currentPlayer = "Toi"; // ⚡ à remplacer par pseudo si multi

if (!scores[currentPlayer]) scores[currentPlayer] = 0;

if (lastDrawing) {
  const card = document.createElement("div");
  card.classList.add("result-card");
  card.innerHTML = `
    <h3>${currentPlayer} - Points: <span class="player-score">${scores[currentPlayer]}</span></h3>
    <img src="${lastDrawing}" alt="ton dessin">
    <div class="vote-buttons">
      <button class="vote-btn up">👍</button>
      <button class="vote-btn down">👎</button>
    </div>
  `;
  userDrawings.appendChild(card);

  // gestion votes
  const upBtn = card.querySelector(".vote-btn.up");
  const downBtn = card.querySelector(".vote-btn.down");
  const scoreDisplay = card.querySelector(".player-score");

  upBtn.addEventListener("click", () => {
    scores[currentPlayer]++;
    scoreDisplay.textContent = scores[currentPlayer];
    localStorage.setItem("scores", JSON.stringify(scores));
  });

  downBtn.addEventListener("click", () => {
    scores[currentPlayer]--;
    scoreDisplay.textContent = scores[currentPlayer];
    localStorage.setItem("scores", JSON.stringify(scores));
  });
}

// bouton next round
document.getElementById("next-round-btn").addEventListener("click", () => {
  localStorage.removeItem("lastDrawing");
  localStorage.removeItem("pokemonId");
  localStorage.removeItem("pokemonNameFr");
  window.location.href = "pagesDraw.html";
});
