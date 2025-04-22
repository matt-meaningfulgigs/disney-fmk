"use strict";
let characters = null;
let selectedCategory = 'all';
let selectedActions = {};
let currentCharacters = [];
async function loadCharacterData() {
    try {
        const response = await fetch('../data/disneyCharacters.json');
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
    if (!characters)
        return [];
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
        const emojiElement = document.getElementById(`character-${index + 1}-emoji`);
        const nameElement = document.getElementById(`character-${index + 1}-name`);
        if (emojiElement && nameElement) {
            console.log(`Setting emoji for ${character.name}:`, character.emoji);
            emojiElement.textContent = character.emoji;
            nameElement.textContent = character.name;
        }
    });
}
function handleAction(event) {
    const button = event.target;
    const action = button.dataset.action;
    const characterIndex = parseInt(button.dataset.character || '0') - 1;
    if (action && characterIndex >= 0) {
        selectedActions[action] = currentCharacters[characterIndex].name;
        button.disabled = true;
        updateShareLink();
    }
}
function updateShareLink() {
    const shareLink = document.getElementById('share-link');
    if (shareLink) {
        const url = new URL(window.location.href);
        url.searchParams.set('characters', currentCharacters.map(c => c.name).join(','));
        url.searchParams.set('actions', JSON.stringify(selectedActions));
        shareLink.href = url.toString();
        shareLink.textContent = 'Share your choices';
    }
}
function loadGameState() {
    var _a;
    if (!characters)
        return;
    const urlParams = new URLSearchParams(window.location.search);
    const characterNames = ((_a = urlParams.get('characters')) === null || _a === void 0 ? void 0 : _a.split(',')) || [];
    const actions = urlParams.get('actions') ? JSON.parse(urlParams.get('actions')) : {};
    if (characterNames.length === 3) {
        const allCharacters = getAvailableCharacters();
        currentCharacters = characterNames
            .map(name => allCharacters.find(c => c.name === name))
            .filter((c) => c !== undefined);
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
