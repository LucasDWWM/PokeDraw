const HowToPlayPage = () => {
    return (
      <section className="mt-10 max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-2">How to play</h1>
  
        <ol className="list-decimal list-inside space-y-3 text-sm text-neutral-800">
          <li>
            <span className="font-semibold">Create or join a game.</span>{" "}
            Depuis la home, clique sur <strong>Create Game</strong> pour créer un salon
            ou rejoins une partie existante depuis <strong>Available games</strong>.
          </li>
          <li>
            <span className="font-semibold">Choisis ton pseudo.</span>{" "}
            Entre ton nom de joueur : il sera utilisé pour associer tes dessins
            dans les résultats.
          </li>
          <li>
            <span className="font-semibold">Attends les autres joueurs.</span>{" "}
            Jusqu’à 4 joueurs peuvent rejoindre la même room. Le statut passe
            de <em>waiting</em> à <em>in-progress</em> puis <em>full</em>.
          </li>
          <li>
            <span className="font-semibold">Dessine le Pokémon.</span>{" "}
            À chaque manche, un Pokémon aléatoire est choisi via PokéAPI.
            Tu as <strong>60 secondes</strong> pour le dessiner de mémoire
            avec les outils : couleurs, différentes tailles de pinceau,
            gomme, et remplissage.
          </li>
          <li>
            <span className="font-semibold">Fin de manche.</span>{" "}
            Quand le timer arrive à 0, ton dessin est automatiquement sauvegardé
            et tu es redirigé vers la page de résultats.
          </li>
          <li>
            <span className="font-semibold">Compare les dessins.</span>{" "}
            Sur l’écran des résultats, tous les dessins des joueurs pour ce
            Pokémon sont affichés côte à côte.
          </li>
          <li>
            <span className="font-semibold">Next round.</span>{" "}
            Le jeu passe à la manche suivante avec un nouveau Pokémon.
          </li>
        </ol>
  
        <p className="text-sm text-neutral-600">
          Astuce : pour tester en local avec plusieurs joueurs, ouvre plusieurs
          navigateurs ou fenêtres privées, ou connecte plusieurs appareils sur le
          même réseau.
        </p>
      </section>
    );
  };
  
  export default HowToPlayPage;  