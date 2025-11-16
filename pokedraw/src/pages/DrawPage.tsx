import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CanvasDrawing from "../components/CanvasDrawing";
import type { Room } from "../types/game";

const API_URL = "http://localhost:8000/room.php";

interface PokemonInfo {
  id: number;
  nameFr: string;
}

const DrawPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [pokemon, setPokemon] = useState<PokemonInfo | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState<number>(1);
  const [phase, setPhase] = useState<"drawing" | "results">("drawing");  

  const playerName = localStorage.getItem("playerName") || "Guest";

  const initPokemon = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    setError(null);

    try {
      // 1) récupérer la room
      const res = await fetch(`${API_URL}?action=get&id=${roomId}`);
      const room: Room & { error?: string } = await res.json();

      if ((room as any).error) {
        setError((room as any).error);
        setLoading(false);
        return;
      }

      setRound(room.currentRound ?? 1);
      setPhase((room as any).phase ?? "drawing");


      // 2) déterminer si c’est le tour du joueur
      const activeIndex = room.currentPlayerIndex ?? 0;
      const activePlayer = room.players?.[activeIndex];
      const isTurn = activePlayer?.name === playerName;
      setIsPlayerTurn(!!isTurn);

      let pokemonId = room.pokemonId;
      let pokemonNameFr = room.pokemonNameFr;

      // 3) si pas encore de Pokémon dans la room → on en tire un au hasard et on l’enregistre
      if (!pokemonId || !pokemonNameFr) {
        const max = 898;
        const randomId = Math.floor(Math.random() * max) + 1;

        const pokemonRes = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${randomId}`
        );
        const pokemonData = await pokemonRes.json();

        const speciesRes = await fetch(
          `https://pokeapi.co/api/v2/pokemon-species/${randomId}`
        );
        const speciesData = await speciesRes.json();

        const frName =
          speciesData.names.find(
            (n: { language: { name: string }; name: string }) =>
              n.language.name === "fr"
          )?.name ?? pokemonData.name;

        pokemonId = randomId;
        pokemonNameFr = frName;

        const formData = new URLSearchParams();
        formData.append("id", roomId);
        formData.append("pokemonId", String(pokemonId));
        formData.append("pokemonNameFr", pokemonNameFr);
        await fetch(`${API_URL}?action=setPokemon`, {
          method: "POST",
          body: formData,
        });
      }

      // 4) sauver dans le state + localStorage
      setPokemon({ id: pokemonId!, nameFr: pokemonNameFr! });
      localStorage.setItem("pokemonId", String(pokemonId));
      localStorage.setItem("pokemonNameFr", pokemonNameFr!);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement du Pokémon.");
      setLoading(false);
    }
  }, [roomId, playerName]);

  useEffect(() => {
    void initPokemon();
  }, [initPokemon]);

  useEffect(() => {
    if (!roomId) return;

    const interval = window.setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}?action=get&id=${roomId}`);
        const room: Room & { error?: string } = await res.json();
        if ((room as any).error) return;

        setRound(room.currentRound ?? 1);
        setPhase((room as any).phase ?? "drawing");

        const activeIndex = room.currentPlayerIndex ?? 0;
        const activePlayer = room.players?.[activeIndex];
        setIsPlayerTurn(activePlayer?.name === playerName);

        if (!pokemon && room.pokemonId && room.pokemonNameFr) {
          setPokemon({ id: room.pokemonId, nameFr: room.pokemonNameFr });
        }

        // si la room passe en phase "results", on envoie tout le monde sur la page résultats
        if ((room as any).phase === "results") {
          navigate(`/results/${roomId}`);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => window.clearInterval(interval);
  }, [roomId, playerName, navigate, pokemon]);


  const handleFinish = async (dataUrl: string) => {
    if (!roomId) return;
    try {
      const formData = new URLSearchParams();
      formData.append("roomId", roomId);
      formData.append("player", playerName);
      formData.append("drawing", dataUrl);

      await fetch(`${API_URL}?action=submitDrawing`, {
        method: "POST",
        body: formData,
      });

      localStorage.setItem("lastDrawing", dataUrl);

      // le joueur a fini son tour, on le bascule en mode "attente"
      setIsPlayerTurn(false);
      // la navigation vers /results sera faite automatiquement
      // par l'effet qui surveille phase === "results"
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l’envoi du dessin.");
    }
  };

  const handleLeave = async () => {
    if (!roomId) return;

    try {
      const formData = new URLSearchParams();
      formData.append("roomId", roomId);
      formData.append("player", playerName);

      await fetch(`${API_URL}?action=leave`, {
        method: "POST",
        body: formData,
      });
    } catch (err) {
      console.error(err);
    } finally {
      navigate("/");
    }
  };

  if (!roomId) {
    return <p className="mt-10 text-center">Room id manquant.</p>;
  }

  return (
    <div className="mt-10">
      {loading && (
        <p className="text-center text-sm text-neutral-500">Chargement…</p>
      )}
      {error && (
        <p className="text-center text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && pokemon && (
        <main className="max-w-5xl mx-auto space-y-6">
          {/* Titre + info round */}
          <header className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Room #{roomId} · Round {round}
            </p>
            <h2 className="text-2xl font-semibold">
              Draw {pokemon.nameFr}
            </h2>
            <p className="text-sm text-neutral-600">
              Tu as 60 secondes pour dessiner ce Pokémon de mémoire.
            </p>
          </header>

          <button
            type="button"
            onClick={handleLeave}
            className="text-xs px-3 py-1 rounded-full border border-neutral-300 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900"
          >
            Leave game
          </button>

          {/* Bloc canvas + outils (équivalent à ton <main class="draw-container">) */}
          <section className="bg-white rounded-3xl shadow p-6 space-y-6">
            {/* Canvas + timer + palette sont gérés par CanvasDrawing */}
            {isPlayerTurn ? (
              <CanvasDrawing onFinish={handleFinish} durationSeconds={60} />
            ) : (
              <div className="mt-6 bg-white rounded-2xl border border-dashed border-neutral-300 p-6 text-center">
                <p className="text-neutral-700 mb-2">
                  Ce n’est pas encore ton tour de dessiner.
                </p>
                <p className="text-sm text-neutral-500">
                  Attends que le joueur courant termine son dessin pour passer à la
                  manche suivante.
                </p>
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
};

export default DrawPage;