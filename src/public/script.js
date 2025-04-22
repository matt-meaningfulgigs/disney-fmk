"use strict";
let characters = null;
let selectedCategory = 'all';
let selectedActions = {};
let currentCharacters = [];

async function loadCharacterData() {
  try {
    const response = await fetch('/data/disneyCharacters.json');
    const data = await response.json();
    characters = data;
    loadGameState();
  }
  catch (error) {
    console.error('Error loading character data:', error);
  }
}

function startNewGame() {
  selectedActions = {};
  selectRandomCharacters();
}

function getAvailableCharacters() {
  if (!characters) return [];
  if (selectedCategory === 'all') {
    return Object.values(characters).flat();
  }
  return characters[selectedCategory] || [];
}

function selectRandomCharacters() {
  const availableCharacters = getAvailableCharacters();
  const shuffled = [...availableCharacters].sort(() => 0.5 - Math.random());
  currentCharacters = shuffled.slice(0, 3);
  displayCharacters();
}

function displayCharacters() {
  console.log('Displaying characters:', currentCharacters);
  currentCharacters.forEach((character, index) => {
    const buttons = document.querySelectorAll(`[data-character="${index + 1}"]`);
    buttons.forEach(button => {
      button.dataset.characterName = character.name;
      button.title = character.name;
    });
  });
}

function handleAction(event) {
  const button = event.target;
  const action = button.dataset.action;
  const characterIndex = parseInt(button.dataset.character || '0') - 1;
  const characterName = button.dataset.characterName;

  if (action && characterIndex >= 0 && characterName) {
    selectedActions[action] = characterName;
    button.disabled = true;
    updateShareLink();
  }
}

function updateShareLink() {
  const url = new URL(window.location.href);
  url.searchParams.set('characters', currentCharacters.map(c => c.name).join(','));
  url.searchParams.set('actions', JSON.stringify(selectedActions));

  const copyUrlBtn = document.getElementById('copyUrl');
  const copyLinkBtn = document.getElementById('copyLink');

  if (copyUrlBtn) {
    copyUrlBtn.onclick = () => {
      navigator.clipboard.writeText(url.toString());
      copyUrlBtn.textContent = '✅';
      setTimeout(() => copyUrlBtn.textContent = '🔗', 2000);
    };
  }

  if (copyLinkBtn) {
    copyLinkBtn.onclick = () => {
      if (navigator.share) {
        navigator.share({
          title: 'Disney FMK',
          text: 'Check out my Disney FMK choices!',
          url: url.toString()
        });
      } else {
        navigator.clipboard.writeText(url.toString());
        copyLinkBtn.textContent = '✅';
        setTimeout(() => copyLinkBtn.textContent = '📤', 2000);
      }
    };
  }
}

function loadGameState() {
  if (!characters) return;

  const urlParams = new URLSearchParams(window.location.search);
  const characterNames = urlParams.get('characters')?.split(',') || [];
  const actions = urlParams.get('actions') ? JSON.parse(urlParams.get('actions')) : {};

  if (characterNames.length === 3) {
    const allCharacters = getAvailableCharacters();
    currentCharacters = characterNames
      .map(name => allCharacters.find(c => c.name === name))
      .filter(c => c !== undefined);

    if (currentCharacters.length === 3) {
      selectedActions = actions;
      displayCharacters();
      return;
    }
  }
  startNewGame();
}

// Initialize the game
loadCharacterData();

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  const categorySelect = document.getElementById('categorySelect');
  const refreshBtn = document.getElementById('refresh');
  const actionButtons = document.querySelectorAll('[data-action]');

  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      selectedCategory = e.target.value;
      startNewGame();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', startNewGame);
  }

  actionButtons.forEach(button => {
    button.addEventListener('click', handleAction);
  });
});
