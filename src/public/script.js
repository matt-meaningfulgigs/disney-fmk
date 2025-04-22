document.addEventListener('DOMContentLoaded', () => {
  let selectedCategory = 'all';
  let selectedActions = {};
  let currentCharacters = [];

  // Get DOM elements
  const newGameBtn = document.getElementById('newGame');
  const copyLinkBtn = document.getElementById('copyLink');
  const copyUrlBtn = document.getElementById('copyUrl');
  const shareLinkInput = document.getElementById('shareLink');
  const categorySelect = document.getElementById('categorySelect');
  const refreshBtn = document.getElementById('refresh');

  // Load character data
  let characterData = {};

  async function loadCharacterData() {
    try {
      const response = await fetch('/api/characters');
      characterData = await response.json();
      console.log('Loaded character data:', characterData);
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
    updateUrl();
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
    console.log('Displaying characters:', characters);
    characters.forEach((character, index) => {
      const emojiElement = document.getElementById(`char${index + 1}-emoji`);
      const nameElement = document.getElementById(`char${index + 1}-name`);
      const buttons = document.querySelectorAll(`.fmk-btn[data-char="${index + 1}"]`);

      if (emojiElement && character.emoji) {
        emojiElement.textContent = character.emoji;
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

    updateUrl();
  }

  // Update URL with current game state
  function updateUrl() {
    const urlParams = new URLSearchParams();

    // Add category
    if (selectedCategory !== 'all') {
      urlParams.set('category', selectedCategory);
    }

    // Add characters and their actions
    currentCharacters.forEach((character, index) => {
      const action = Object.entries(selectedActions).find(([_, charIdx]) => charIdx === (index + 1).toString())?.[0];
      if (action) {
        urlParams.set(character.name.toLowerCase().replace(/\s+/g, ''), action);
      }
    });

    // Update URL without reloading the page
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({}, '', newUrl);
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

  // Handle category change
  function handleCategoryChange(event) {
    selectedCategory = event.target.value;
    startNewGame();
  }

  // Load game state from URL
  function loadGameState() {
    const urlParams = new URLSearchParams(window.location.search);

    // Get category from URL
    const category = urlParams.get('category');
    if (category) {
      selectedCategory = category;
      if (categorySelect) {
        categorySelect.value = category;
      }
    }

    // Get available characters
    const availableCharacters = getAvailableCharacters();

    // Get characters and actions from URL
    const characters = [];
    const actions = {};

    urlParams.forEach((value, key) => {
      if (key !== 'category') {
        const character = availableCharacters.find(char =>
          char.name.toLowerCase().replace(/\s+/g, '') === key
        );
        if (character) {
          characters.push(character);
          actions[value] = characters.length.toString();
        }
      }
    });

    if (characters.length === 3) {
      currentCharacters = characters;
      selectedActions = actions;
      displayCharacters(currentCharacters);

      // Restore button states
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
  }

  // Add event listeners
  categorySelect.addEventListener('change', handleCategoryChange);
  refreshBtn.addEventListener('click', startNewGame);
  document.querySelectorAll('.fmk-btn').forEach(btn => {
    btn.addEventListener('click', handleAction);
  });
  copyLinkBtn.addEventListener('click', handleShare);
  copyUrlBtn.addEventListener('click', copyUrl);

  // Initialize the game
  loadCharacterData();
}); 
