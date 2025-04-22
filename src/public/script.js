document.addEventListener('DOMContentLoaded', () => {
  let selectedCategories = ['princesses', 'villains', 'sidekicks', 'princes'];
  let selectedActions = {};

  // Get DOM elements
  const newGameBtn = document.getElementById('newGame');
  const copyLinkBtn = document.getElementById('copyLink');
  const shareLinkInput = document.getElementById('shareLink');
  const categoryCheckboxes = document.querySelectorAll('.category-selector input[type="checkbox"]');

  // Load character data
  let characterData = {};

  async function loadCharacterData() {
    try {
      const response = await fetch('/api/characters');
      characterData = await response.json();
      startNewGame();
    } catch (error) {
      console.error('Error loading character data:', error);
    }
  }

  // Initialize the game
  function startNewGame() {
    selectedActions = {};
    const availableCharacters = getAvailableCharacters();
    const selectedCharacters = selectRandomCharacters(availableCharacters, 3);
    displayCharacters(selectedCharacters);
    updateShareLink();
  }

  // Get characters from selected categories
  function getAvailableCharacters() {
    return selectedCategories.flatMap(category => characterData[category] || []);
  }

  // Select random characters
  function selectRandomCharacters(characters, count) {
    const shuffled = [...characters].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Display characters
  function displayCharacters(characters) {
    characters.forEach((character, index) => {
      const emojiElement = document.getElementById(`char${index + 1}-emoji`);
      const nameElement = document.getElementById(`char${index + 1}-name`);
      const selectElement = document.querySelector(`select[data-char="${index + 1}"]`);

      emojiElement.textContent = character.emoji;
      nameElement.textContent = character.name;
      selectElement.value = '';
      selectElement.disabled = false;
    });
  }

  // Handle action selection
  function handleActionSelect(event) {
    const charIndex = event.target.dataset.char;
    const action = event.target.value;

    // Clear previous selection if any
    if (selectedActions[action]) {
      const prevSelect = document.querySelector(`select[data-char="${selectedActions[action]}"]`);
      if (prevSelect) prevSelect.value = '';
    }

    // Update selection
    if (action) {
      selectedActions[action] = charIndex;
    } else {
      delete selectedActions[charIndex];
    }

    // Disable used actions in other selects
    updateSelects();
    updateShareLink();
  }

  // Update select dropdowns
  function updateSelects() {
    const selects = document.querySelectorAll('.action-select');
    selects.forEach(select => {
      const options = select.querySelectorAll('option');
      options.forEach(option => {
        if (option.value) {
          option.disabled = selectedActions[option.value] && selectedActions[option.value] !== select.dataset.char;
        }
      });
    });
  }

  // Update share link
  function updateShareLink() {
    const gameState = {
      categories: selectedCategories,
      characters: Array.from(document.querySelectorAll('.character-card')).map(card => ({
        name: card.querySelector('h2').textContent,
        action: card.querySelector('select').value
      }))
    };

    const encodedState = btoa(JSON.stringify(gameState));
    const shareUrl = `${window.location.origin}${window.location.pathname}?state=${encodedState}`;
    return shareUrl;
  }

  // Handle share button click
  async function handleShare() {
    const shareUrl = updateShareLink();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Disney FMK',
          text: 'Check out my Disney FMK choices!',
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  }

  // Copy to clipboard
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  // Handle category toggle
  function handleCategoryToggle(event) {
    const category = event.target.id;
    if (event.target.checked) {
      selectedCategories.push(category);
    } else {
      selectedCategories = selectedCategories.filter(c => c !== category);
    }
    startNewGame();
  }

  // Load game state from URL
  function loadGameState() {
    const urlParams = new URLSearchParams(window.location.search);
    const stateParam = urlParams.get('state');

    if (stateParam) {
      try {
        const gameState = JSON.parse(atob(stateParam));
        selectedCategories = gameState.categories;

        // Update category toggles
        document.querySelectorAll('.toggle input').forEach(toggle => {
          toggle.checked = selectedCategories.includes(toggle.id);
        });

        // Display characters and their actions
        gameState.characters.forEach((character, index) => {
          const emojiElement = document.getElementById(`char${index + 1}-emoji`);
          const nameElement = document.getElementById(`char${index + 1}-name`);
          const selectElement = document.querySelector(`select[data-char="${index + 1}"]`);

          emojiElement.textContent = characterData[selectedCategories[index % selectedCategories.length]]
            .find(c => c.name === character.name)?.emoji || '';
          nameElement.textContent = character.name;
          selectElement.value = character.action;

          if (character.action) {
            selectedActions[character.action] = (index + 1).toString();
          }
        });

        updateSelects();
      } catch (error) {
        console.error('Error loading game state:', error);
        startNewGame();
      }
    } else {
      startNewGame();
    }
  }

  // Event listeners
  newGameBtn.addEventListener('click', startNewGame);
  copyLinkBtn.addEventListener('click', handleShare);
  document.querySelectorAll('.toggle input').forEach(toggle => {
    toggle.addEventListener('change', handleCategoryToggle);
  });
  document.getElementById('refresh').addEventListener('click', startNewGame);
  document.querySelectorAll('.action-select').forEach(select => {
    select.addEventListener('change', handleActionSelect);
  });

  // Add touch feedback for mobile
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('touchstart', () => {
      btn.style.transform = 'scale(0.98)';
    });
    btn.addEventListener('touchend', () => {
      btn.style.transform = 'scale(1)';
    });
  });

  // Prevent pull-to-refresh on mobile
  document.body.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
}); 
