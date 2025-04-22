document.addEventListener('DOMContentLoaded', () => {
  let selectedCategory = 'all';
  let selectedActions = {};
  let currentCharacters = [];

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
      loadGameState();
    } catch (error) {
      console.error('Error loading character data:', error);
    }
  }

  // Initialize the game
  function startNewGame() {
    selectedActions = {};
    const availableCharacters = getAvailableCharacters();
    currentCharacters = selectRandomCharacters(availableCharacters, 3);
    displayCharacters(currentCharacters);
    updateShareLink();
  }

  // Get characters from selected category
  function getAvailableCharacters() {
    if (selectedCategory === 'all') {
      return Object.values(characterData).flat();
    }
    return characterData[selectedCategory] || [];
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
      const buttons = document.querySelectorAll(`.fmk-btn[data-char="${index + 1}"]`);

      emojiElement.textContent = character.emoji;
      nameElement.textContent = character.name;

      buttons.forEach(btn => {
        btn.disabled = false;
      });
    });
  }

  // Handle action selection
  function handleAction(event) {
    const action = event.target.dataset.action;
    const charIndex = event.target.dataset.char;

    // If this action is already selected for another character, return
    if (selectedActions[action] && selectedActions[action] !== charIndex) {
      return;
    }

    // Update selected action
    selectedActions[action] = charIndex;

    // Disable all buttons for this character
    document.querySelectorAll(`.fmk-btn[data-char="${charIndex}"]`).forEach(btn => {
      btn.disabled = true;
    });

    // Disable this action for other characters
    document.querySelectorAll(`.fmk-btn[data-action="${action}"]`).forEach(btn => {
      if (btn.dataset.char !== charIndex) {
        btn.disabled = true;
      }
    });

    updateShareLink();
  }

  // Update share link
  function updateShareLink() {
    const gameState = {
      category: selectedCategory,
      characters: currentCharacters.map((character, index) => ({
        name: character.name,
        action: Object.entries(selectedActions).find(([_, charIdx]) => charIdx === (index + 1).toString())?.[0] || ''
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

  // Handle category change
  function handleCategoryChange(event) {
    selectedCategory = event.target.value;
    startNewGame();
  }

  // Load game state from URL
  function loadGameState() {
    const urlParams = new URLSearchParams(window.location.search);
    const stateParam = urlParams.get('state');

    if (stateParam) {
      try {
        const gameState = JSON.parse(atob(stateParam));
        selectedCategory = gameState.category;

        // Update category select
        document.getElementById('categorySelect').value = selectedCategory;

        // Get available characters
        const availableCharacters = getAvailableCharacters();

        // Find and display the characters from the game state
        currentCharacters = gameState.characters.map(charState => {
          return availableCharacters.find(char => char.name === charState.name);
        }).filter(Boolean);

        if (currentCharacters.length === 3) {
          displayCharacters(currentCharacters);

          // Restore actions
          gameState.characters.forEach((charState, index) => {
            if (charState.action) {
              const actionBtn = document.querySelector(`.fmk-btn[data-char="${index + 1}"][data-action="${charState.action}"]`);
              if (actionBtn) {
                actionBtn.disabled = true;
                selectedActions[charState.action] = (index + 1).toString();
              }
            }
          });

          // Disable used actions
          Object.entries(selectedActions).forEach(([action, charIndex]) => {
            document.querySelectorAll(`.fmk-btn[data-action="${action}"]`).forEach(btn => {
              if (btn.dataset.char !== charIndex) {
                btn.disabled = true;
              }
            });
          });
        } else {
          startNewGame();
        }
      } catch (error) {
        console.error('Error loading game state:', error);
        startNewGame();
      }
    } else {
      startNewGame();
    }
  }

  // Event listeners
  document.getElementById('categorySelect').addEventListener('change', handleCategoryChange);
  document.getElementById('refresh').addEventListener('click', startNewGame);
  document.getElementById('copyLink').addEventListener('click', handleShare);
  document.querySelectorAll('.fmk-btn').forEach(btn => {
    btn.addEventListener('click', handleAction);
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

  // Initialize
  loadCharacterData();
}); 
