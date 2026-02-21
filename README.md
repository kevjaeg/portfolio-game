# Portfolio Game

An interactive 2D developer portfolio built as a top-down pixel-art game. Walk around the room, explore objects, and discover my skills, projects, and experience.

**[Play it live](https://kevjaeg.github.io/portfolio-game/)**

## About

Instead of a traditional portfolio website, this project presents my developer profile as an explorable game world. Visitors control a character through a room and interact with objects (PC, bookshelf, TV, etc.) to learn about my tech stack, projects, certifications, and more.

Built with a JARVIS dark-mode aesthetic featuring glassmorphism dialogs, typewriter text effects, and a sci-fi color palette.

## Tech Stack

- **[KAPLAY](https://kaplayjs.com/)** -- 2D game engine (successor to Kaboom.js)
- **Vite** -- Build tool and dev server
- **Vanilla JS** -- No framework, ES Modules
- **Tiled** -- Map editor (JSON export)
- **GitHub Pages** -- Hosting via GitHub Actions

## Features

- Keyboard (WASD / Arrow Keys) and click-to-move controls
- A* pathfinding for click-to-move navigation
- Interactive zones with JARVIS-styled dialog overlays
- Typewriter text effect with skip-on-click
- Mobile touch controls (D-Pad)
- Responsive camera scaling
- Loading screen with animated progress bar

## Run Locally

```bash
npm install
npm run dev
```

## License

MIT
