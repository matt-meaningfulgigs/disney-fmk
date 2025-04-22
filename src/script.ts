interface Character {
    name: string;
    emoji: string;
    category: string;
}

let characters: Character[] = [];
let currentCharacters: Character[] = [];

async function loadCharacters(): Promise<void> {
    try {
        const response = await fetch('../data/disneyCharacters.json');
        const data = await response.json();
        // Flatten all characters into a single array
        characters = [
            ...data.princesses,
            ...data.villains,
            ...data.sidekicks,
            ...data.princes
        ];
        loadGameState();
    } catch (error) {
        console.error('Error loading characters:', error);
    }
}

function selectRandomCharacters(): void {
    const shuffled = [...characters].sort(() => 0.5 - Math.random());
    currentCharacters = shuffled.slice(0, 3);
    updateURL();
    displayCharacters();
}

function displayCharacters(): void {
    currentCharacters.forEach((character, index) => {
        const emojiElement = document.getElementById(`character-${index + 1}-emoji`);
        const nameElement = document.getElementById(`character-${index + 1}-name`);
        
        if (emojiElement && nameElement) {
            emojiElement.textContent = character.emoji;
            nameElement.textContent = character.name;
        }
    });
}

function updateURL(): void {
    const url = new URL(window.location.href);
    // Clear existing parameters
    url.search = '';
    // Add character names as parameters
    currentCharacters.forEach((character, index) => {
        url.searchParams.set(`character${index + 1}`, character.name);
    });
    // Update URL without reloading
    window.history.pushState({}, '', url.toString());
}

function handleAction(event: Event): void {
    const button = event.target as HTMLButtonElement;
    const action = button.dataset.action;
    const characterIndex = parseInt(button.dataset.character || '0') - 1;
    
    if (action && characterIndex >= 0) {
        const url = new URL(window.location.href);
        url.searchParams.set(`character${characterIndex + 1}`, action);
        window.history.pushState({}, '', url.toString());
        button.disabled = true;
    }
}

function loadGameState(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const characterNames = [
        urlParams.get('character1'),
        urlParams.get('character2'),
        urlParams.get('character3')
    ];

    // If we have valid character names in the URL, use them
    if (characterNames.every(name => name && characters.some(c => c.name === name))) {
        currentCharacters = characterNames
            .map(name => characters.find(c => c.name === name))
            .filter((c): c is Character => c !== undefined);
        displayCharacters();
    } else {
        // Otherwise, select random characters
        selectRandomCharacters();
    }
}

// Initialize the game
loadCharacters(); 
