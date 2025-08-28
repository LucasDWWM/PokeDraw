const roomList = document.getElementById("roomList");
const createRoomBtn = document.getElementById("createRoomBtn");
const roomNameInput = document.getElementById("roomName");
const roomPasswordInput = document.getElementById("roomPassword");
const playerName = localStorage.getItem("playerName") || "Guest";

// --- Fonction pour récupérer et afficher les rooms ---
async function renderRooms() {
    const res = await fetch('rooms.php?action=list');
    const rooms = await res.json();

    roomList.innerHTML = "";
    rooms.forEach((room) => {
        const tr = document.createElement("tr");
        const playersCount = `${room.players.length}/4`;
        const status = room.status === "waiting" ? "Waiting" : room.status === "in-progress" ? "In Progress" : "Full";

        tr.innerHTML = `
            <td>${room.id}</td>
            <td>${playersCount}</td>
            <td>${status}</td>
            <td><button class="join-btn" data-id="${room.id}" ${room.status==="full"?"disabled":""}>Join</button></td>
        `;
        roomList.appendChild(tr);
    });

    document.querySelectorAll(".join-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.getAttribute("data-id");
            let password = "";
            if (!e.target.disabled) {
                password = prompt("Mot de passe ?") || "";
            }

            const formData = new URLSearchParams();
            formData.append('id', id);
            formData.append('player', playerName);
            formData.append('password', password);

            const res = await fetch('rooms.php?action=join', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.error) {
                alert(data.error);
                return;
            }

            window.location.href = `../pagesDraw/pagesDraw.html?roomId=${id}`;
        });
    });
}

// --- Créer une room ---
createRoomBtn.addEventListener("click", async () => {
    const name = roomNameInput.value.trim();
    const password = roomPasswordInput.value.trim();
    if (!name) {
        alert("Le nom du salon est obligatoire !");
        return;
    }

    const formData = new URLSearchParams();
    formData.append('name', name);
    formData.append('password', password);

    const res = await fetch('rooms.php?action=create', { method: 'POST', body: formData });
    const newRoom = await res.json();
    if (newRoom.error) {
        alert(newRoom.error);
        return;
    }

    roomNameInput.value = "";
    roomPasswordInput.value = "";
    renderRooms();
});

// --- Initialisation ---
renderRooms();
