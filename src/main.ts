import chars from './characters.json'

type Choice = 'fuck' | 'marry' | 'kill'
type Gender = 'male' | 'female' | 'neutral'
interface Character { 
  id: string
  name: string
  emoji: string
  category: string
  gender: Gender
  media: {
    title: string
    year: number
    type: string
  }
  stats: {
    age: number
    height: string
    measurements?: string
    build?: string
    hair: string
    eyes: string
  }
}

interface Slot { char: Character; choice?: Choice }

// Extended universe setup
const extendedUniverseCheckbox = document.getElementById('extended-universe') as HTMLInputElement;
const extendedUniverseCategories = new Set([
  'Star Wars',
  'Simpsons',
  'Marvel'
]);

// URL and state management
const url = new URL(window.location.href)
const params = url.searchParams

// Get initial state from URL
const getInitialState = () => {
  const slots: Slot[] = []
  const initialGender = params.get('gender') as Gender || 'all'
  const initialCategory = params.get('category') || 'All Categories'

  // Try to load characters from URL parameters
  for (let i = 1; i <= 3; i++) {
    const p = params.get(`char${i}`)
    if (p) {
      const [id, sel] = p.split(',')
      const c = (chars as Character[]).find(x => x.id === id)
      if (c) {
        // Always add characters from URL, even if they're extended universe
        slots.push({ 
          char: c, 
          choice: (['fuck','marry','kill'] as const).includes(sel as any) ? sel as Choice : undefined 
        })
      }
    }
  }

  return { slots, initialGender, initialCategory }
}

// helper: pick N random distinct
function pickRandom<T>(arr: T[], n: number): T[] {
  if (!arr.length) return []
  if (arr.length < n) n = arr.length // Only pick as many as available
  const copy = arr.slice(), res: T[] = []
  while (res.length < n && copy.length) {
    res.push(copy.splice(Math.floor(Math.random()*copy.length),1)[0])
  }
  return res
}

// Filter characters by category and gender
function filterCharacters(characters: Character[], category?: string, gender?: string): Character[] {
  let filtered = characters
  if (category && category !== 'All Categories') {
    filtered = filtered.filter(c => c.category === category)
  }
  if (gender && gender !== 'all') {
    filtered = filtered.filter(c => c.gender === gender)
  }
  // Filter out extended universe characters if extended mode is off
  if (!extendedUniverseCheckbox.checked) {
    filtered = filtered.filter(c => !extendedUniverseCategories.has(c.category))
  }
  return filtered
}

// Initialize state
const { slots, initialGender, initialCategory } = getInitialState()

// Set initial extended universe state to false
if (extendedUniverseCheckbox) {
  extendedUniverseCheckbox.checked = false
}

// Create filters
const categorySelect = document.createElement('select')
categorySelect.id = 'category'
const genderSelect = document.createElement('select')
genderSelect.id = 'gender'

// Add category options
const allCategories = ['All Categories', ...new Set((chars as Character[]).map(c => c.category))]

// Add all category options but hide extended ones initially
allCategories.forEach(category => {
  const option = document.createElement('option')
  option.value = category
  option.textContent = category
  if (category === initialCategory) {
    option.selected = true
  }
  // Hide extended universe categories initially
  if (extendedUniverseCategories.has(category)) {
    option.style.display = 'none'
  }
  categorySelect.appendChild(option)
})

// Define gender options
const baseGenderOptions = [
  { value: 'all', text: "I'm super bisexual" },
  { value: 'female', text: 'Women only' },
  { value: 'male', text: 'Men only' }
]

// Define extended universe gender options
const extendedGenderOptions = [
  { value: 'robot', text: 'Robots only' },
  { value: 'plant', text: 'Plants only' },
  { value: 'raccoon', text: 'Raccoons only' },
  { value: 'fluid', text: 'Gender Fluid only' }
]

// Add all gender options but hide extended ones initially
const allGenderOptions = [...baseGenderOptions, ...extendedGenderOptions]
allGenderOptions.forEach(option => {
  const opt = document.createElement('option')
  opt.value = option.value
  opt.textContent = option.text
  if (opt.value === initialGender) {
    opt.selected = true
  }
  // Hide extended universe gender options initially
  if (extendedGenderOptions.some(ext => ext.value === option.value)) {
    opt.style.display = 'none'
  }
  genderSelect.appendChild(opt)
})

// Create filter groups
const categoryGroup = document.createElement('div')
categoryGroup.className = 'filter-group'
categoryGroup.appendChild(categorySelect)

const genderGroup = document.createElement('div')
genderGroup.className = 'filter-group'
genderGroup.appendChild(genderSelect)

// Add filters to top bar
const topBar = document.querySelector('.top-bar')!
const filterGroups = document.createElement('div')
filterGroups.className = 'filter-groups'
filterGroups.appendChild(genderGroup)
filterGroups.appendChild(categoryGroup)
topBar.insertBefore(filterGroups, topBar.firstChild)

// If we have characters from URL, use them
if (slots.length > 0) {
  render()
} else {
  // If no valid characters from URL, pick random ones
  const filteredChars = filterCharacters(chars as Character[], initialCategory, initialGender)
  const randomChars = pickRandom(filteredChars, 3)
  slots.push(...randomChars.map(char => ({ char, choice: undefined })))
  render()
}

// Update URL with current state
function updateURL() {
  const newParams = new URLSearchParams()
  
  // Add character states
  slots.forEach((s, i) => {
    if (s.choice) {
      newParams.set(`char${i+1}`, `${s.char.id},${s.choice}`)
    } else {
      newParams.set(`char${i+1}`, s.char.id)
    }
  })
  
  // Add filters
  const selectedGender = genderSelect.value
  if (selectedGender && selectedGender !== 'all') {
    newParams.set('gender', selectedGender)
  }
  
  const selectedCategory = categorySelect.value
  if (selectedCategory && selectedCategory !== 'All Categories') {
    newParams.set('category', selectedCategory)
  }
  
  // Update URL without reloading
  const newURL = `${location.pathname}?${newParams.toString()}`
  history.replaceState(null, '', newURL)
  
  // Update share button title with new URL
  const shareBtn = document.getElementById('share')
  if (shareBtn) {
    shareBtn.title = 'Copy Link'
  }
}

// Share functionality
function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text).then(() => {
    const shareBtn = document.getElementById('share')
    if (shareBtn) {
      const originalTitle = shareBtn.title
      shareBtn.title = 'Copied!'
      setTimeout(() => {
        shareBtn.title = originalTitle
      }, 2000)
    }
  }).catch(err => {
    console.error('Failed to copy:', err)
  })
}

// render UI
function render() {
  const container = document.querySelector('#cards')
  if (!container) {
    console.error('Cards container not found')
    return
  }
  
  // Get all selected choices to disable them in other cards
  const selectedChoices = slots.map(slot => slot.choice).filter(Boolean) as Choice[]
  
  container.innerHTML = ''
  slots.forEach((slot, i) => {
    const card = document.createElement('div')
    card.className = `card${slot.choice === 'kill' ? ' killed' : ''}${slot.choice === 'fuck' ? ' fucked' : ''}${slot.choice === 'marry' ? ' married' : ''}`
    card.setAttribute('role', 'article')
    card.setAttribute('aria-label', `${slot.char.name} card`)
    
    card.innerHTML = `
      <div class="content">
        <div class="header">
          <h2>${slot.char.name}</h2>
          <div class="gender">${slot.char.gender === 'female' ? '♀' : slot.char.gender === 'male' ? '♂' : '⚧'}</div>
        </div>
        <div class="emoji" role="img" aria-label="${slot.char.name}">${slot.char.emoji}</div>
        <div class="info">
          ${slot.char.media ? `
            <div class="media">${slot.char.media.title} (${slot.char.media.year})</div>
          ` : ''}
          ${slot.char.stats ? `
            <div class="stats">
              <div><span class="label">Age:</span> ${slot.char.stats.age}</div>
              <div><span class="label">Height:</span> ${slot.char.stats.height}</div>
              ${slot.char.stats.measurements ? `<div><span class="label">Sizes:</span> ${slot.char.stats.measurements}</div>` : ''}
              ${slot.char.stats.build ? `<div><span class="label">Build:</span> ${slot.char.stats.build}</div>` : ''}
              <div><span class="label">Hair:</span> ${slot.char.stats.hair}</div>
              <div><span class="label">Eyes:</span> ${slot.char.stats.eyes}</div>
            </div>
          ` : ''}
        </div>
        <div class="buttons" role="group" aria-label="Choose option for ${slot.char.name}">
          ${(['fuck','marry','kill'] as Choice[]).map(opt =>
            `<button 
              data-slot="${i}" 
              data-choice="${opt}" 
              class="${slot.choice === opt ? `selected ${opt}` : opt}"
              ${selectedChoices.includes(opt) && slot.choice !== opt ? 'disabled' : ''}
              aria-pressed="${slot.choice === opt}"
            >${opt}</button>`
          ).join('')}
        </div>
      </div>
    `
    container.append(card)
  })
  
  // Update URL with current state
  updateURL()
}

// Add event listeners
extendedUniverseCheckbox.addEventListener('change', updateFilters)
categorySelect.addEventListener('change', updateFilters)
genderSelect.addEventListener('change', updateFilters)

// Add event listeners for buttons
document.getElementById('refresh')?.addEventListener('click', () => {
  const btn = document.getElementById('refresh') as HTMLButtonElement
  btn.disabled = true
  
  const selectedCategory = categorySelect.value
  const selectedGender = genderSelect.value as Gender
  const filteredChars = filterCharacters(chars as Character[], selectedCategory, selectedGender)
  const randomChars = pickRandom(filteredChars, 3)
  
  // Clear existing slots
  slots.length = 0
  
  // Add new characters
  slots.push(...randomChars.map(char => ({ char, choice: undefined })))
  
  render()
  
  // Re-enable button after animation
  setTimeout(() => {
    btn.disabled = false
  }, 500)
})

document.getElementById('share')?.addEventListener('click', () => {
  copyToClipboard(window.location.href)
})

// Add event delegation for choice buttons
document.querySelector('#cards')?.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (target.matches('button[data-slot]')) {
    const slot = parseInt(target.getAttribute('data-slot')!)
    const choice = target.getAttribute('data-choice') as Choice
    
    // Toggle choice
    if (slots[slot].choice === choice) {
      slots[slot].choice = undefined
    } else {
      slots[slot].choice = choice
    }
    
    render()
  }
})

function updateFilters() {
  const genderFilter = genderSelect.value;
  const categoryFilter = categorySelect.value;
  const showExtended = extendedUniverseCheckbox.checked;

  // Toggle 80s theme
  document.body.classList.toggle('extended-universe-active', showExtended);

  // Update gender options text
  const allOption = genderSelect.querySelector('option[value="all"]')
  if (allOption) {
    allOption.textContent = showExtended ? "I'm super omnisexual" : "I'm super bisexual"
  }

  // Update category options based on extended universe toggle
  Array.from(categorySelect.options).forEach(option => {
    if (option.value && extendedUniverseCategories.has(option.value)) {
      option.style.display = showExtended ? '' : 'none';
      // If the currently selected category is an extended universe category and we're turning off extended universe,
      // reset to "All Categories"
      if (!showExtended && option.selected) {
        categorySelect.value = 'All Categories';
      }
    }
  });

  // Update gender options based on extended universe toggle
  Array.from(genderSelect.options).forEach(option => {
    if (option.value && extendedGenderOptions.some(ext => ext.value === option.value)) {
      option.style.display = showExtended ? '' : 'none';
      // If the currently selected gender is an extended universe gender and we're turning off extended universe,
      // reset to "all"
      if (!showExtended && option.selected) {
        genderSelect.value = 'all';
      }
    }
  });

  // Filter characters based on current filters and extended universe state
  let filteredCharacters = filterCharacters(chars as Character[], categorySelect.value, genderSelect.value);

  // If no characters match the current filters, fall back to all available characters
  if (filteredCharacters.length === 0) {
    filteredCharacters = filterCharacters(chars as Character[], 'All Categories', 'all');
  }

  // Clear existing slots and pick new random characters
  slots.length = 0;
  const randomChars = pickRandom(filteredCharacters, 3);
  slots.push(...randomChars.map(char => ({ char, choice: undefined })));
  
  render();
}
