interface Character {
    name: string;
    emoji: string;
    category: string;
}

type Categories = 'princesses' | 'villains' | 'sidekicks' | 'princes';

interface CharacterData {
    [key: string]: Character[];
}

let characters: CharacterData | null = null;
let selectedCategory: string = 'all';
let selectedActions: { [key: string]: string } = {};
let currentCharacters: Character[] = [];

async function loadCharacterData(): Promise<void> {
    try {
        const response = await fetch('../data/disneyCharacters.json');
        const data = await response.json();
        characters = data as CharacterData;
        loadGameState();
    } catch (error) {
        console.error('Error loading character data:', error);
    }
}

function startNewGame(): void {
    selectedActions = {};
    selectRandomCharacters();
}

function getAvailableCharacters(): Character[] {
    if (!characters) return [];
    
    if (selectedCategory === 'all') {
        return Object.values(characters).flat();
    }
    
    return characters[selectedCategory] || [];
}

function selectRandomCharacters(): void {
    const availableCharacters = getAvailableCharacters();
    const shuffled = [...availableCharacters].sort(() => 0.5 - Math.random());
    currentCharacters = shuffled.slice(0, 3);
    displayCharacters();
}

function displayCharacters(): void {
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

function handleAction(event: Event): void {
    const button = event.target as HTMLButtonElement;
    const action = button.dataset.action;
    const characterIndex = parseInt(button.dataset.character || '0') - 1;
    
    if (action && characterIndex >= 0) {
        selectedActions[action] = currentCharacters[characterIndex].name;
        button.disabled = true;
        updateShareLink();
    }
}

function updateShareLink(): void {
    const shareLink = document.getElementById('share-link') as HTMLAnchorElement;
    if (shareLink) {
        const url = new URL(window.location.href);
        url.searchParams.set('characters', currentCharacters.map(c => c.name).join(','));
        url.searchParams.set('actions', JSON.stringify(selectedActions));
        shareLink.href = url.toString();
        shareLink.textContent = 'Share your choices';
    }
}

function loadGameState(): void {
    if (!characters) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const characterNames = urlParams.get('characters')?.split(',') || [];
    const actions = urlParams.get('actions') ? JSON.parse(urlParams.get('actions')!) : {};
    
    if (characterNames.length === 3) {
        const allCharacters = getAvailableCharacters();
        currentCharacters = characterNames
            .map(name => allCharacters.find(c => c.name === name))
            .filter((c): c is Character => c !== undefined);
        
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
