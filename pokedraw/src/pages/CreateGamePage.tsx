import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Room } from "../types/game";

const API_URL = "/PokeDraw/room.php"; // adapte le chemin si besoin

const CreateGamePage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [playerName, setPlayerName] = useState(
    localStorage.getItem("playerName") ?? ""
  );
  const navigate = useNavigate();

  const fetchRooms = async () => {
    const res = await fetch(`${API_URL}?action=list`); const data = await res.json();
    setRooms(data);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    const formData = new URLSearchParams();
    formData.append("name", roomName);
    formData.append("password", roomPassword);
    formData.append("player", playerName || "Guest");

    const res = await fetch(`${API_URL}?action=create`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    localStorage.setItem("playerName", playerName || "Guest");
    navigate(`/draw/${data.id}`);
  };

  const handleJoin = async (room: Room) => {
    const pwd = room.password ? prompt("Mot de passe ?") ?? "" : "";
    const formData = new URLSearchParams();
    formData.append("id", room.id); // PHP attend "id" (on gère aussi roomId côté PHP, mais autant rester propre)
    formData.append("password", pwd);
    formData.append("player", playerName || "Guest");

    // join
    const res = await fetch(`${API_URL}?action=join`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    localStorage.setItem("playerName", playerName || "Guest");
    navigate(`/draw/${room.id}`);
  };

  return (
    <div className="mt-10 space-y-8">
      <section className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Create a new game</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Game name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Password (optional)"
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={handleCreateRoom}
          className="mt-4 px-5 py-2 rounded-full bg-neutral-900 text-white text-sm hover:bg-neutral-800"
        >
          Create Game
        </button>
      </section>

      <section className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Available games</h2>
          <button
            onClick={fetchRooms}
            className="text-sm underline decoration-dotted"
          >
            Refresh
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b text-left text-neutral-500">
            <tr>
              <th className="py-2">Game ID</th>
              <th className="py-2">Players</th>
              <th className="py-2">Status</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => {
              const playersCount = `${room.players.length}/4`;
              const label =
                room.status === "waiting"
                  ? "Waiting"
                  : room.status === "in-progress"
                    ? "In progress"
                    : "Full";

              const canJoin = room.status !== "full";

              return (
                <tr key={room.id} className="border-b last:border-0">
                  <td className="py-2">{room.id}</td>
                  <td className="py-2">{playersCount}</td>
                  <td className="py-2">{label}</td>
                  <td className="py-2">
                    <button
                      disabled={!canJoin}
                      onClick={() => handleJoin(room)}
                      className={`px-3 py-1 rounded-full text-xs border ${canJoin
                          ? "border-neutral-900 hover:bg-neutral-900 hover:text-white"
                          : "border-neutral-300 text-neutral-400 cursor-not-allowed"
                        }`}
                    >
                      {canJoin ? "Join" : "Full"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {rooms.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-neutral-400">
                  No games yet. Create the first one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default CreateGamePage;
