document.addEventListener('DOMContentLoaded', () => {
  let selectedCategory = 'all';
  let selectedActions = {};
  let currentCharacters = [];

  // Get DOM elements
  const newGameBtn = document.getElementById('newGame');
  const copyLinkBtn = document.getElementById('copyLink');
  const shareLinkInput = document.getElementById('shareLink');
  const categorySelect = document.getElementById('categorySelect');

  // Load character data
  let characterData = {};

  async function loadCharacterData() {
    try {
      const response = await fetch('/api/characters');
      characterData = await response.json();
      console.log('Loaded character data:', characterData); // Debug log
      loadGameState();
    } catch (error) {
      console.error('Error loading character data:', error);
    }
  }

  // Initialize the game
  function startNewGame() {
    selectedActions = {};
    const availableCharacters = getAvailableCharacters();
    console.log('Available characters:', availableCharacters); // Debug log
    currentCharacters = selectRandomCharacters(availableCharacters, 3);
    console.log('Selected characters:', currentCharacters); // Debug log
    displayCharacters(currentCharacters);
    updateShareLink();
  }

  // Get characters from selected category
  function getAvailableCharacters() {
    if (selectedCategory === 'all') {
      const allCharacters = Object.values(characterData).flat();
      console.log('All characters:', allCharacters); // Debug log
      return allCharacters;
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
    console.log('Displaying characters:', characters); // Debug log
    characters.forEach((character, index) => {
      const emojiElement = document.getElementById(`char${index + 1}-emoji`);
      const nameElement = document.getElementById(`char${index + 1}-name`);
      const buttons = document.querySelectorAll(`.fmk-btn[data-char="${index + 1}"]`);

      console.log(`Character ${index + 1}:`, character); // Debug log
      console.log(`Emoji element for ${character.name}:`, emojiElement); // Debug log
      console.log(`Setting emoji for ${character.name}:`, character.emoji); // Debug log

      if (emojiElement && character.emoji) {
        emojiElement.textContent = character.emoji;
      } else {
        console.error(`Failed to set emoji for ${character.name}`);
      }

      if (nameElement) {
        nameElement.textContent = character.name;
      }

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
    console.log('Category changed to:', selectedCategory); // Debug log
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
        console.log('Loading game state:', gameState); // Debug log

        // Update category select
        if (categorySelect) {
          categorySelect.value = selectedCategory;
        }

        // Get available characters
        const availableCharacters = getAvailableCharacters();

        // Find and display the characters from the game state
        currentCharacters = gameState.characters.map(charState => {
          return availableCharacters.find(char => char.name === charState.name);
        }).filter(Boolean);

        console.log('Restored characters:', currentCharacters); // Debug log

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

  // Add event listeners
  categorySelect.addEventListener('change', handleCategoryChange);
  document.querySelectorAll('.fmk-btn').forEach(btn => {
    btn.addEventListener('click', handleAction);
  });
  copyLinkBtn.addEventListener('click', handleShare);

  // Initialize the game
  loadCharacterData();
}); 
