document.addEventListener('DOMContentLoaded', () => {
  let selectedCategory = 'all';
  let selectedActions = {};
  let currentCharacters = [];
  let characters = {};

  // Get DOM elements
  const newGameBtn = document.getElementById('newGame');
  const copyLinkBtn = document.getElementById('copyLink');
  const copyUrlBtn = document.getElementById('copyUrl');
  const shareLinkInput = document.getElementById('shareLink');
  const categorySelect = document.getElementById('categorySelect');
  const refreshBtn = document.getElementById('refresh');

  // Load character data
  async function loadCharacterData() {
    try {
      const response = await fetch('../data/disneyCharacters.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      characters = await response.json();
      newGame();
    } catch (error) {
      console.error('Error loading character data:', error);
    }
  }

  function getRandomCharacters(category = 'all') {
    let pool = [];
    if (category === 'all') {
      pool = [...characters.princesses, ...characters.villains, ...characters.sidekicks];
    } else {
      pool = characters[category];
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }

  function createCharacterCard(character, index) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.innerHTML = `
      <div class="emoji">${character.emoji}</div>
      <div class="name">${character.name}</div>
      <div class="buttons">
        <button class="fuck" onclick="handleAction('fuck', ${index})">Fuck</button>
        <button class="marry" onclick="handleAction('marry', ${index})">Marry</button>
        <button class="kill" onclick="handleAction('kill', ${index})">Kill</button>
      </div>
    `;
    return card;
  }

  function displayCharacters(characters) {
    const container = document.getElementById('characters');
    container.innerHTML = '';
    characters.forEach((character, index) => {
      container.appendChild(createCharacterCard(character, index));
    });
  }

  function handleAction(action, index) {
    // If this action is already selected for another character, return
    if (selectedActions[action] !== undefined && selectedActions[action] !== index) {
      return;
    }

    // Update selected action
    selectedActions[action] = index;

    // Disable all buttons for this character
    const buttons = document.querySelectorAll(`.character-card:nth-child(${index + 1}) button`);
    buttons.forEach(btn => btn.disabled = true);

    // Disable this action for other characters
    document.querySelectorAll(`.${action}`).forEach(btn => {
      if (btn.parentElement.parentElement !== buttons[0].parentElement.parentElement) {
        btn.disabled = true;
      }
    });
  }

  function newGame() {
    selectedActions = {};
    currentCharacters = getRandomCharacters(selectedCategory);
    displayCharacters(currentCharacters);
  }

  // Handle category change
  function handleCategoryChange(event) {
    selectedCategory = event.target.value;
    newGame();
  }

  // Handle share button click
  async function handleShare() {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Disney FMK',
          text: 'Check out my Disney FMK choices!',
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  }

  // Copy URL to clipboard
  function copyUrl() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('URL copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy URL:', err);
    });
  }

  // Add event listeners
  categorySelect.addEventListener('change', handleCategoryChange);
  refreshBtn.addEventListener('click', newGame);
  document.querySelectorAll('.fmk-btn').forEach(btn => {
    btn.addEventListener('click', handleAction);
  });
  copyLinkBtn.addEventListener('click', handleShare);
  copyUrlBtn.addEventListener('click', copyUrl);

  // Make handleAction available globally
  window.handleAction = handleAction;

  // Start the game
  loadCharacterData();
}); 
