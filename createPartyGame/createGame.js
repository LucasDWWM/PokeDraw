let rooms = JSON.parse(localStorage.getItem("rooms")) || [];
const roomList = document.getElementById("roomList");
const createRoomBtn = document.getElementById("createRoomBtn");
const roomNameInput = document.getElementById("roomName");
const roomPasswordInput = document.getElementById("roomPassword");

function renderRooms() {
  roomList.innerHTML = "";
  rooms.forEach((room, index) => {
    const tr = document.createElement("tr");

    const playersCount = `${room.players.length}/4`;
    const status = room.status === "waiting"
      ? "Waiting"
      : room.status === "in-progress"
      ? "In Progress"
      : "Full";

    tr.innerHTML = `
      <td>${room.id}</td>
      <td>${playersCount}</td>
      <td>${status}</td>
      <td><button class="join-btn" data-index="${index}">Join</button></td>
    `;
    roomList.appendChild(tr);
  });

  document.querySelectorAll(".join-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      const room = rooms[index];

      if (room.status === "full") {
        alert("Ce salon est plein !");
        return;
      }

      if (room.password) {
        const inputPass = prompt("Mot de passe ?");
        if (inputPass !== room.password) {
          alert("Mot de passe incorrect !");
          return;
        }
      }

      const playerName = localStorage.getItem("playerName") || "Guest";
      if (!room.players.find(p => p.name === playerName)) {
        room.players.push({ name: playerName, ready: false });
      }

      if (room.players.length >= 4) {
        room.status = "full";
      } else {
        room.status = "waiting";
      }

      localStorage.setItem("rooms", JSON.stringify(rooms));
      window.location.href = `pagesDraw.html?roomId=${room.id}`;
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

  const newRoom = {
    id: "Game " + (rooms.length + 1),
    name,
    password,
    players: [],
    status: "waiting"
  };

  rooms.push(newRoom);
  localStorage.setItem("rooms", JSON.stringify(rooms));
  roomNameInput.value = "";
  roomPasswordInput.value = "";
  renderRooms();
});

renderRooms();
