// récupérer pokemon choisi
const pokemonName = localStorage.getItem("pokemon");

// fetch API pokedex
fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById("pokemon-img").src = data.sprites.front_default;
    document.getElementById("pokemon-name").textContent =
      pokemonName.toUpperCase();
  });

// récupérer les dessins
const userDrawings = document.getElementById("user-drawings");
const lastDrawing = localStorage.getItem("lastDrawing");

if (lastDrawing) {
  const card = document.createElement("div");
  card.classList.add("result-card");
  card.innerHTML = `
    <h3>You</h3>
    <img src="${lastDrawing}" alt="your drawing">
    <div class="vote-buttons">
      <button class="vote-btn">👍</button>
      <button class="vote-btn">👎</button>
    </div>
  `;
  userDrawings.appendChild(card);
}

// bouton next round
document.getElementById("next-round-btn").addEventListener("click", () => {
  localStorage.removeItem("lastDrawing");
  localStorage.removeItem("pokemon"); // <<< reset pour tirage aléatoire
  window.location.href = "pagesDraw.html";
});
