import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Room } from "../types/game";

const API_URL = "http://localhost:8000/room.php";

interface DrawingEntry {
  player: string;
  dataUrl: string;
}

const ResultsPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [pokemonName, setPokemonName] = useState<string | null>(null);
  const [pokemonImage, setPokemonImage] = useState<string | null>(null);
  const [drawings, setDrawings] = useState<DrawingEntry[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});

  // Charger infos Pokémon depuis localStorage + PokeAPI
  useEffect(() => {
    const name = localStorage.getItem("pokemonNameFr");
    const id = localStorage.getItem("pokemonId");

    if (name) setPokemonName(name);

    if (id) {
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then((res) => res.json())
        .then((data) => {
          const sprite =
            data.sprites?.front_default ??
            data.sprites?.other?.["official-artwork"]?.front_default ??
            "";
          setPokemonImage(sprite);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  // Charger dessins + scores
  useEffect(() => {
    const loadDrawings = async () => {
      if (!roomId) return;

      const res = await fetch(`${API_URL}?action=list`);
      const rooms: (Room & { drawings?: Record<string, string> })[] =
        await res.json();

      const room = rooms.find((r) => r.id === roomId);
      if (!room || !room.drawings) return;

      const storedScores =
        (JSON.parse(localStorage.getItem("scores") ?? "{}") as Record<
          string,
          number
        >) || {};

      const entries: DrawingEntry[] = Object.entries(room.drawings).map(
        ([player, dataUrl]) => ({
          player,
          dataUrl: dataUrl as string,
        })
      );

      const initialScores: Record<string, number> = { ...storedScores };
      for (const { player } of entries) {
        if (typeof initialScores[player] !== "number") {
          initialScores[player] = 0;
        }
      }

      setScores(initialScores);
      setDrawings(entries);
    };

    void loadDrawings();
  }, [roomId]);

  const updateScore = (player: string, delta: number) => {
    setScores((prev) => {
      const next = { ...prev, [player]: (prev[player] ?? 0) + delta };
      localStorage.setItem("scores", JSON.stringify(next));
      return next;
    });
  };

  const handleNextRound = async () => {
    if (!roomId) return;

    try {
      const formData = new URLSearchParams();
      formData.append("roomId", roomId);

      await fetch(`${API_URL}?action=nextRound`, {
        method: "POST",
        body: formData,
      });


      localStorage.removeItem("lastDrawing");
      localStorage.removeItem("pokemonId");
      localStorage.removeItem("pokemonNameFr");

      navigate(`/draw/${roomId}`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du passage à la manche suivante.");
    }
  };
  const handleLeave = async () => {
    if (!roomId) return;

    try {
      const playerName = localStorage.getItem("playerName") || "Guest";

      const formData = new URLSearchParams();
      formData.append("roomId", roomId);
      formData.append("player", playerName);

      await fetch(`${API_URL}?action=leave`, {
        method: "POST",
        body: formData,
      });

      localStorage.removeItem("lastDrawing");
      localStorage.removeItem("pokemonId");
      localStorage.removeItem("pokemonNameFr");

      navigate(`/`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sortie de la partie.");
    }
  };
  if (!roomId) {
    return <p className="mt-10 text-center">Room id manquant.</p>;
  }

  return (
    <div className="mt-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Room #{roomId}
          </p>
          <h1 className="text-2xl font-semibold">Round Results</h1>
        </div>

        <div className="flex items-center gap-4 bg-white rounded-2xl shadow px-4 py-3">
          {pokemonImage && (
            <img
              src={pokemonImage}
              alt={pokemonName ?? "Pokémon"}
              className="w-16 h-16 object-contain"
            />
          )}
          <div className="text-left">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Original Pokémon
            </p>
            <p className="text-lg font-semibold">
              {pokemonName ?? "Inconnu"}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {drawings.map(({ player, dataUrl }) => (
          <article
            key={player}
            className="bg-white rounded-2xl shadow p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{player}</span>
              <span className="text-xs text-neutral-500">
                Score&nbsp;: {scores[player] ?? 0}
              </span>
            </div>

            <div className="aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src={dataUrl}
                alt={`Drawing by ${player}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-center gap-3 mt-2">
              <button
                onClick={() => updateScore(player, 1)}
                className="px-3 py-1 rounded-full border text-xs font-medium"
              >
                +1
              </button>
              <button
                onClick={() => updateScore(player, -1)}
                className="px-3 py-1 rounded-full border text-xs font-medium"
              >
                -1
              </button>
            </div>
          </article>
        ))}

        {drawings.length === 0 && (
          <p className="text-sm text-neutral-500">
            Aucun dessin pour l’instant. Attends que les joueurs aient terminé
            leur manche.
          </p>
        )}
      </section>

      <div className="flex justify-center">
        <button
          onClick={handleNextRound}
          className="px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800"
        >
          Next Round
        </button>
        <button
          type="button"
          onClick={handleLeave}
          className="text-xs px-3 py-1 rounded-full border border-neutral-300 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900"
        >
          Leave game
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;