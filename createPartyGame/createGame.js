let rooms = JSON.parse(localStorage.getItem("rooms")) || [];

const roomList = document.getElementById("roomList");
const createRoomBtn = document.getElementById("createRoomBtn");
const roomNameInput = document.getElementById("roomName");
const roomPasswordInput = document.getElementById("roomPassword");

function renderRooms() {
  roomList.innerHTML = "";
  rooms.forEach((room, index) => {
    const div = document.createElement("div");
    div.classList.add("room");
    div.innerHTML = `
      <strong>${room.name}</strong>
      <button class="join-btn" data-index="${index}">Rejoindre</button>
    `;
    roomList.appendChild(div);
  });

  document.querySelectorAll(".join-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      const room = rooms[index];

      if (room.password) {
        const inputPass = prompt("Mot de passe ?");
        if (inputPass === room.password) {
          alert("Connexion réussie au salon : " + room.name);
        } else {
          alert("Mot de passe incorrect !");
        }
      } else {
        alert("Connexion réussie au salon : " + room.name);
      }
    });
  });
}

createRoomBtn.addEventListener("click", () => {
  const name = roomNameInput.value.trim();
  const password = roomPasswordInput.value.trim();
  if (!name) {
    alert("Le nom du salon est obligatoire !");
    return;
  }

  rooms.push({ name, password });
  localStorage.setItem("rooms", JSON.stringify(rooms));
  roomNameInput.value = "";
  roomPasswordInput.value = "";
  renderRooms();
});

renderRooms();
