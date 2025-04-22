# Disney FMK

A "Fuck, Marry, Kill" game featuring Disney characters.

## Features

- Character categories: Princesses, Villains, Sidekicks, Princes
- Category filtering
- Shareable game links
- Mobile-friendly design
- Emoji-based character representation

## Tech Stack

- Next.js
- TypeScript
- Express
- GitHub Pages

## Development

```bash
npm install
npm run dev
```

## Deployment

Automatically deployed to GitHub Pages via GitHub Actions.

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
