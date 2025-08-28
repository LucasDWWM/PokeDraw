const params = new URLSearchParams(window.location.search);
const roomId = params.get("roomId");
const playerName = localStorage.getItem("playerName") || "Toi";

const pokemonId = localStorage.getItem("pokemonId");
const pokemonNameFr = localStorage.getItem("pokemonNameFr");

fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
.then(res=>res.json())
.then(data=>{
    document.getElementById("pokemon-img").src = data.sprites.front_default || data.sprites.other["official-artwork"].front_default || "";
    document.getElementById("pokemon-name").textContent = pokemonNameFr;
});

// récupérer les dessins depuis le serveur
async function renderDrawings(){
    const res = await fetch('rooms.php?action=list');
    const rooms = await res.json();
    const room = rooms.find(r=>r.id===roomId);
    if(!room) return;

    const userDrawings = document.getElementById("user-drawings");
    userDrawings.innerHTML = "";

    const scores = JSON.parse(localStorage.getItem("scores")) || {};

    for(const [player, drawing] of Object.entries(room.drawings)){
        if(!scores[player]) scores[player]=0;

        const card = document.createElement("div");
        card.classList.add("result-card");
        card.innerHTML = `
            <h3>${player} - Points: <span class="player-score">${scores[player]}</span></h3>
            <img src="${drawing}" alt="dessin de ${player}">
            <div class="vote-buttons">
                <button class="vote-btn up">👍</button>
                <button class="vote-btn down">👎</button>
            </div>
        `;
        userDrawings.appendChild(card);

        const upBtn = card.querySelector(".vote-btn.up");
        const downBtn = card.querySelector(".vote-btn.down");
        const scoreDisplay = card.querySelector(".player-score");

        upBtn.addEventListener("click",()=>{
            scores[player]++;
            scoreDisplay.textContent = scores[player];
            localStorage.setItem("scores",JSON.stringify(scores));
        });

        downBtn.addEventListener("click",()=>{
            scores[player]--;
            scoreDisplay.textContent = scores[player];
            localStorage.setItem("scores",JSON.stringify(scores));
        });
    }
}
renderDrawings();

document.getElementById("next-round-btn").addEventListener("click",()=>{
    localStorage.removeItem("lastDrawing");
    localStorage.removeItem("pokemonId");
    localStorage.removeItem("pokemonNameFr");
    window.location.href="pagesDraw.html?roomId="+roomId;
});
