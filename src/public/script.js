document.addEventListener('DOMContentLoaded', () => {
  const characters = [];
  const selectedActions = {};
  let currentGameState = {};

  // Get DOM elements
  const newGameBtn = document.getElementById('newGame');
  const copyLinkBtn = document.getElementById('copyLink');
  const shareLinkInput = document.getElementById('shareLink');
  const categoryCheckboxes = document.querySelectorAll('.category-selector input[type="checkbox"]');

  // Load game state from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const gameState = urlParams.get('state');
  if (gameState) {
    try {
      currentGameState = JSON.parse(atob(gameState));
      loadGameState(currentGameState);
    } catch (e) {
      console.error('Invalid game state in URL');
      startNewGame();
    }
  } else {
    startNewGame();
  }

  // Event listeners
  newGameBtn.addEventListener('click', startNewGame);
  copyLinkBtn.addEventListener('click', shareGame);
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

  async function startNewGame() {
    // Get selected categories
    const selectedCategories = Array.from(categoryCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.id);

    try {
      const response = await fetch(`/api/characters?categories=${selectedCategories.join(',')}`);
      const data = await response.json();

      // Update UI with new characters
      data.forEach((character, index) => {
        const imgElement = document.getElementById(`char${index + 1}-img`);
        const nameElement = document.getElementById(`char${index + 1}-name`);

        imgElement.src = `/images/${character.image}`;
        nameElement.textContent = character.name;

        // Reset buttons
        document.querySelectorAll(`.fmk-btn[data-char="${index + 1}"]`).forEach(btn => {
          btn.disabled = false;
        });
      });

      // Reset game state
      characters.length = 0;
      characters.push(...data);
      selectedActions.fuck = null;
      selectedActions.marry = null;
      selectedActions.kill = null;

      // Update URL
      updateShareLink();
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  }

  function handleAction(event) {
    const action = event.target.dataset.action;
    const charIndex = event.target.dataset.char - 1;

    // If this action is already selected for another character, return
    if (selectedActions[action] !== null && selectedActions[action] !== charIndex) {
      return;
    }

    // Update selected action
    selectedActions[action] = charIndex;

    // Disable all buttons for this character
    document.querySelectorAll(`.fmk-btn[data-char="${charIndex + 1}"]`).forEach(btn => {
      btn.disabled = true;
    });

    // Disable this action for other characters
    document.querySelectorAll(`.fmk-btn[data-action="${action}"]`).forEach(btn => {
      if (btn.dataset.char !== (charIndex + 1).toString()) {
        btn.disabled = true;
      }
    });

    // Update URL
    updateShareLink();
  }

  function updateShareLink() {
    const gameState = {
      characters: characters.map(char => char.name),
      actions: selectedActions
    };

    const baseUrl = window.location.origin + window.location.pathname;
    const stateParam = btoa(JSON.stringify(gameState));
    const shareUrl = `${baseUrl}?state=${stateParam}`;

    shareLinkInput.value = shareUrl;
  }

  function shareGame() {
    const shareUrl = shareLinkInput.value;

    // Check if we're on iOS and can use the native share sheet
    if (navigator.share) {
      navigator.share({
        title: 'Disney FMK',
        text: 'Check out my Disney FMK choices!',
        url: shareUrl
      }).catch(err => {
        console.error('Error sharing:', err);
        fallbackShare(shareUrl);
      });
    } else {
      fallbackShare(shareUrl);
    }
  }

  function fallbackShare(shareUrl) {
    // Fallback for browsers that don't support the Web Share API
    shareLinkInput.select();
    document.execCommand('copy');

    // Show feedback
    const originalText = copyLinkBtn.textContent;
    copyLinkBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyLinkBtn.textContent = originalText;
    }, 2000);
  }

  function loadGameState(state) {
    // Load characters
    state.characters.forEach((characterName, index) => {
      const imgElement = document.getElementById(`char${index + 1}-img`);
      const nameElement = document.getElementById(`char${index + 1}-name`);

      // Find character in our data
      const character = characters.find(char => char.name === characterName);
      if (character) {
        imgElement.src = `/images/${character.image}`;
        nameElement.textContent = character.name;
      }
    });

    // Load actions
    Object.entries(state.actions).forEach(([action, charIndex]) => {
      if (charIndex !== null) {
        selectedActions[action] = charIndex;

        // Disable buttons
        document.querySelectorAll(`.fmk-btn[data-char="${charIndex + 1}"]`).forEach(btn => {
          btn.disabled = true;
        });

        document.querySelectorAll(`.fmk-btn[data-action="${action}"]`).forEach(btn => {
          if (btn.dataset.char !== (charIndex + 1).toString()) {
            btn.disabled = true;
          }
        });
      }
    });
  }

  // Prevent pull-to-refresh on mobile
  document.body.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
}); 
