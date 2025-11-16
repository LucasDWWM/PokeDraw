const AboutPage = () => {
    return (
      <section className="mt-10 max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold mb-2">About PokeDraw</h1>
  
        <p className="text-sm text-neutral-800">
          PokeDraw est un petit jeu multijoueur inspiré de Gartic Phone et des
          jeux de dessin Pokémon. L’idée : dessiner des Pokémon de mémoire, comparer
          les résultats entre amis, et surtout rigoler sur les proportions ratées.
        </p>
  
        <p className="text-sm text-neutral-800">
          Le projet est développé en{" "}
          <strong>React</strong>, <strong>TypeScript</strong> et{" "}
          <strong>Tailwind CSS</strong> côté front, avec un petit backend{" "}
          <strong>PHP + JSON</strong> pour gérer les salons et les dessins. Les données
          Pokémon (sprites, noms, types) viennent de{" "}
          <a
            href="https://pokeapi.co"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            PokéAPI
          </a>
          .
        </p>
  
        <p className="text-sm text-neutral-800">
          C’est aussi un projet de portfolio pour expérimenter le temps réel, la gestion
          de rooms, et une direction artistique inspirée du Pokédex et des jeux de dessin
          en ligne.
        </p>
      </section>
    );
  };
  
  export default AboutPage;  