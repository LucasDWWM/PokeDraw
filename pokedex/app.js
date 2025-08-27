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
  'normal', 'combat', 'vol',
  'poison', 'sol', 'roche',
  'insecte', 'spectre', 'acier',
  'feu', 'eau', 'plante',
  'électrique', 'psy', 'glace',
  'dragon', 'ténèbre', 'fée'
];
let prevUrl = null;
let nextUrl = null;

// Helpers
const capitalize = (str) => str[0].toUpperCase() + str.substr(1);

const resetScreen = () => {
  mainScreen.classList.remove('hide');
  for (const type of TYPES) {
    mainScreen.classList.remove(type);
  }
};

// Fetch list of Pokémon (Tyradex supports offset & limit)
const fetchPokeList = url => {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const { results, previous, next } = data;
      prevUrl = previous;
      nextUrl = next;

      for (let i = 0; i < pokeListItems.length; i++) {
        const pokeListItem = pokeListItems[i];
        const resultData = results[i];

        if (resultData) {
          const { id, name } = resultData;
          pokeListItem.textContent = `${id}. ${capitalize(name.fr || name.en)}`;
        } else {
          pokeListItem.textContent = '';
        }
      }
    });
};

// Fetch Pokémon data
const fetchPokeData = id => {
  fetch(`https://tyradex.vercel.app/pokemon/${id}`)
    .then(res => res.json())
    .then(data => {
      resetScreen();

      // Types
      const dataTypes = data.types;
      const dataFirstType = dataTypes[0];
      const dataSecondType = dataTypes[1];
      pokeTypeOne.textContent = capitalize(dataFirstType.type.name);
      if (dataSecondType) {
        pokeTypeTwo.classList.remove('hide');
        pokeTypeTwo.textContent = capitalize(dataSecondType.type.name);
      } else {
        pokeTypeTwo.classList.add('hide');
        pokeTypeTwo.textContent = '';
      }
      mainScreen.classList.add(dataFirstType.type.name);

      // Infos générales
      pokeName.textContent = capitalize(data.name.fr || data.name.en);
      pokeId.textContent = '#' + data.id.toString().padStart(3, '0');
      pokeWeight.textContent = data.weight;
      pokeHeight.textContent = data.height;
      pokeFrontImage.src = data.sprites.front_default || '';
      pokeBackImage.src = data.sprites.back_default || '';

      // Affiche l'écran
      mainScreen.classList.remove('hide');
    });
};

// Boutons prev/next
const handleLeftButtonClick = () => { if (prevUrl) fetchPokeList(prevUrl); };
const handleRightButtonClick = () => { if (nextUrl) fetchPokeList(nextUrl); };

// Liste de Pokémon clic
const handleListItemClick = (e) => {
  if (!e.target) return;
  const listItem = e.target;
  if (!listItem.textContent) return;
  const id = listItem.textContent.split('.')[0];
  fetchPokeData(id);
};

// Event listeners
leftButton.addEventListener('click', handleLeftButtonClick);
rightButton.addEventListener('click', handleRightButtonClick);
for (const pokeListItem of pokeListItems) {
  pokeListItem.addEventListener('click', handleListItemClick);
}

// Initialisation
fetchPokeList('https://tyradex.vercel.app/pokemon?offset=0&limit=20');
