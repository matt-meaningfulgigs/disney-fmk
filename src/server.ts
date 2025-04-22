import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Load Disney characters data
const charactersData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'disneyCharacters.json'), 'utf-8')
);

// API endpoint to get all characters
app.get('/api/characters', (req, res) => {
  console.log('Sending character data:', charactersData); // Debug log
  res.json(charactersData);
});

// Serve the main HTML file for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Only start the server if not running on GitHub Pages
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

export default app; 
