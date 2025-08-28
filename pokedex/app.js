// DOM Objects
const mainScreen = document.querySelector('.main-screen');
const pokeName = document.querySelector('.poke-name');
const pokeId = document.querySelector('.poke-id');
const pokeFrontImage = document.querySelector('.poke-front-image');
const pokeBackImage = document.querySelector('.poke-back-image');
const pokeTypeOne = document.querySelector('.poke-type-one');
const pokeTypeTwo = document.querySelector('.poke-type-two');
const pokeWeight = document.querySelector('.poke-weight');
const pokeHeight = document.querySelector('.poke-height');
const pokeListItems = document.querySelectorAll('.list-item');
const leftButton = document.querySelector('.left-button');
const rightButton = document.querySelector('.right-button');

// constants and variables
const TYPES = [
  'normal', 'fighting', 'flying',
  'poison', 'ground', 'rock',
  'bug', 'ghost', 'steel',
  'fire', 'water', 'grass',
  'electric', 'psychic', 'ice',
  'dragon', 'dark', 'fairy'
];
let prevUrl = null;
let nextUrl = null;

// Traduction FR des types Pokémon
const TYPE_TRANSLATIONS = {
  normal: "Normal",
  fighting: "Combat",
  flying: "Vol",
  poison: "Poison",
  ground: "Sol",
  rock: "Roche",
  bug: "Insecte",
  ghost: "Spectre",
  steel: "Acier",
  fire: "Feu",
  water: "Eau",
  grass: "Plante",
  electric: "Électrik",
  psychic: "Psy",
  ice: "Glace",
  dragon: "Dragon",
  dark: "Ténèbres",
  fairy: "Fée"
};

// Functions
const capitalize = (str) => str[0].toUpperCase() + str.substr(1);

const resetScreen = () => {
  mainScreen.classList.remove('hide');
  for (const type of TYPES) {
    mainScreen.classList.remove(type);
  }
};

// Fetch liste Pokémon avec noms FR
const fetchPokeList = url => {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const { results, previous, next } = data;
      prevUrl = previous;
      nextUrl = next;

      results.forEach((resultData, i) => {
        const pokeListItem = pokeListItems[i];
        if (resultData) {
          const urlArray = resultData.url.split('/');
          const id = urlArray[urlArray.length - 2];

          // ⚡ Toujours prendre le nom FR
          fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
            .then(res => res.json())
            .then(speciesData => {
              const frName = speciesData.names.find(n => n.language.name === "fr");
              pokeListItem.textContent = id + '. ' + frName.name;
            });
        } else {
          pokeListItems[i].textContent = '';
        }
      });
    });
};

// Fetch détails Pokémon avec noms FR
const fetchPokeData = id => {
  fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    .then(res => res.json())
    .then(data => {
      resetScreen();

      const dataTypes = data['types'];
      const dataFirstType = dataTypes[0];
      const dataSecondType = dataTypes[1];

      pokeTypeOne.textContent = TYPE_TRANSLATIONS[dataFirstType['type']['name']];
      if (dataSecondType) {
        pokeTypeTwo.classList.remove('hide');
        pokeTypeTwo.textContent = TYPE_TRANSLATIONS[dataSecondType['type']['name']];
      } else {
        pokeTypeTwo.classList.add('hide');
        pokeTypeTwo.textContent = '';
      }
      mainScreen.classList.add(dataFirstType['type']['name']);

      pokeId.textContent = '#' + data['id'].toString().padStart(3, '0');
      pokeWeight.textContent = (data['weight'] / 10) + " kg"; // ⚡ Conversion hectogrammes → kg
      pokeHeight.textContent = (data['height'] / 10) + " m"; // ⚡ Conversion décimètres → m
      pokeFrontImage.src = data['sprites']['front_default'] || '';
      pokeBackImage.src = data['sprites']['back_default'] || '';

      // ⚡ Nom FR uniquement
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
        .then(res => res.json())
        .then(speciesData => {
          const frName = speciesData.names.find(n => n.language.name === "fr");
          pokeName.textContent = frName.name;
        });
    });
};


// Boutons navigation liste
const handleLeftButtonClick = () => {
  if (prevUrl) {
    fetchPokeList(prevUrl);
  }
};

const handleRightButtonClick = () => {
  if (nextUrl) {
    fetchPokeList(nextUrl);
  }
};

// Click sur Pokémon dans la liste
const handleListItemClick = (e) => {
  if (!e.target) return;
  const listItem = e.target;
  if (!listItem.textContent) return;

  const id = listItem.textContent.split('.')[0];
  fetchPokeData(id);
};

// adding event listeners
leftButton.addEventListener('click', handleLeftButtonClick);
rightButton.addEventListener('click', handleRightButtonClick);
for (const pokeListItem of pokeListItems) {
  pokeListItem.addEventListener('click', handleListItemClick);
}

// initialize App
fetchPokeList('https://pokeapi.co/api/v2/pokemon?offset=0&limit=20');
