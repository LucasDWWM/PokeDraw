import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <section className="flex flex-col items-center text-center mt-16">
      <h1 className="text-5xl font-bold mb-4">PokeDraw</h1>
      <p className="text-neutral-700 mb-8 max-w-md">
        A multiplayer drawing game where you draw Pokémon from memory.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/draw/demo" // on remplacera "demo" par un vrai roomId quand on aura créé/choisi la partie
          className="px-6 py-3 rounded-full border border-neutral-900 text-neutral-900 text-sm font-medium hover:bg-neutral-900 hover:text-white transition"
        >
          Join Game
        </Link>
        <Link
          to="/create"
          className="px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition"
        >
          Create Game
        </Link>
      </div>
    </section>
  );
};

export default HomePage;
