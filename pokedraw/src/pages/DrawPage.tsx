import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CanvasDrawing from "../components/CanvasDrawing";
import type { Room } from "../types/game";

const API_URL = "/PokeDraw/room.php";

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
      navigate(`/results/${roomId}`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l’envoi du dessin.");
    }
  };

  if (!roomId) {
    return <p className="mt-10 text-center">Room id manquant.</p>;
  }

  return (
    <div className="mt-10 space-y-6">
      {loading && <p className="text-center text-sm text-neutral-500">Chargement…</p>}
      {error && (
        <p className="text-center text-sm text-red-500">
          {error}
        </p>
      )}

      {!loading && !error && pokemon && (
        <>
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Room #{roomId} · Round {room.currentRound ?? 1}
              </p>

              <h1 className="text-2xl font-semibold">
                {isPlayerTurn
                  ? `Dessine ${pokemon.nameFr}`
                  : `En attente… ${pokemon.nameFr}`}
              </h1>
            </div>
          </div>

          {isPlayerTurn ? (
            <CanvasDrawing onFinish={handleFinish} durationSeconds={60} />
          ) : (
            <div className="mt-6 bg-white rounded-2xl shadow p-6 text-center">
              <p className="text-neutral-700 mb-2">
                Ce n’est pas encore ton tour de dessiner.
              </p>
              <p className="text-sm text-neutral-500">
                Attends que le joueur courant termine son dessin pour passer à la
                manche suivante.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DrawPage;