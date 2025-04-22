# Disney FMK

A fun game where you choose which Disney characters to Fuck, Marry, or Kill. The game randomly selects three Disney characters from your chosen categories (Princesses, Villains, Sidekicks, and Princes) and lets you make your choices.

## Features

- Random selection of 3 Disney characters
- Category filtering (Princesses, Villains, Sidekicks, Princes)
- Shareable game state via URL
- Responsive design
- No duplicate characters
- Each action (Fuck, Marry, Kill) can only be used once

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   npm start
   ```

## How to Play

1. Select which categories of Disney characters you want to include using the checkboxes
2. Click "New Game" to get three random characters
3. For each character, choose whether to Fuck, Marry, or Kill them
4. Each action can only be used once
5. Share your choices with friends using the "Copy Link" button

## Project Structure

- `src/server.ts` - Express server and API endpoints
- `src/public/index.html` - Main HTML file
- `src/public/styles.css` - CSS styles
- `src/public/script.js` - Frontend JavaScript
- `src/data/disneyCharacters.json` - Character data
- `src/public/images/` - Character images

## Contributing

Feel free to submit issues and enhancement requests!
