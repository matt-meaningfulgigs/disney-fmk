# Kingdom of FMK

A modern, interactive web application that puts a playful twist on the classic "Fuck, Marry, Kill" game, featuring a carefully curated selection of characters from popular media. Built with TypeScript, Vite, and modern web technologies.

> Made by Matt, for Jan and her friends to use once and forget about. I spent way too much time on this, but hey, at least it looks pretty! 😅

## 🎮 Features

- **Interactive Character Cards**: Beautiful, responsive cards with detailed character information
- **Real-time State Management**: Seamless updates and state persistence
- **Shareable Game States**: Generate and share unique URLs for your game sessions
- **Filtering Options**: Filter characters by gender and media category
- **Responsive Design**: Optimized for all devices, from desktop to mobile
- **Accessibility**: Built with ARIA attributes and keyboard navigation support
- **Dark Mode Support**: Automatic theme switching based on system preferences

## 🛠️ Technical Stack

- **Frontend Framework**: Vite + TypeScript
- **Styling**: Modern CSS with CSS Variables
- **State Management**: URL-based state management
- **Deployment**: GitHub Pages with GitHub Actions
- **Build Tools**: Node.js, npm

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/disney-fmk.git
   cd disney-fmk
   ```

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
   ```

## 🎨 Project Structure

```
disney-fmk/
├── src/
│   ├── main.ts          # Main application logic
│   └── characters.json  # Character data
├── public/             # Static assets
├── index.html         # Entry point
├── vite.config.ts     # Vite configuration
└── package.json       # Project dependencies
```

## 🔧 Configuration

The application can be configured through various environment variables and build settings:

- `base`: Base URL for the application (configured in `vite.config.ts`)
- Character data can be modified in `src/characters.json`

## 🌐 Deployment

The application is automatically deployed to GitHub Pages using GitHub Actions. The deployment workflow:

1. Builds the application
2. Uploads the build artifacts
3. Deploys to GitHub Pages

Deployment is triggered on:
- Push to main branch
- Manual workflow dispatch

## 📱 URL Parameters

The application supports various URL parameters for sharing game states:

- `char1`, `char2`, `char3`: Character IDs and their selected choices
- `gender`: Gender filter preference
- `category`: Media category filter

Example URL:
```
https://yourusername.github.io/disney-fmk/?char1=id1,fuck&char2=id2,marry&char3=id3,kill&gender=female&category=Movies
```

## 🎯 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Deployed with [GitHub Pages](https://pages.github.com/)
- Icons from [Material Icons](https://fonts.google.com/icons)
- Made with love, caffeine, and questionable life choices

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers. But seriously, it's just a game - if it breaks, just refresh the page! 😉

---

Built with ❤️ (and probably too much time) by Matt 
