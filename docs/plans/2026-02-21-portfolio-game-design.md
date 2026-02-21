# 2D Portfolio Game - JARVIS Dark-Mode Edition

## Design Document

**Date:** 2026-02-21
**Status:** Approved

---

## Overview

Interactive developer portfolio as a 2D top-down game. Visitors control a pixel-art character through a sci-fi themed room (Pokemon Red bedroom style) and interact with objects to discover portfolio information.

**Target audience:** Recruiters, potential clients, other developers.
**Goal:** Stand out from standard portfolios, demonstrate technical skills through the portfolio itself.

---

## Stack

| Component | Technology | Why |
|---|---|---|
| Game Engine | KAPLAY 3001.x | Active fork of Kaboom.js, same API, better maintained |
| Build Tool | Vite 6.x | Fast dev server, optimized builds, native ES Modules |
| Language | JavaScript (ES Modules) | No TS overhead for V1, migration-ready |
| Map Editor | Tiled | Industry standard for 2D tile maps, JSON export |
| Styling | Vanilla CSS + Custom Properties | Full control over JARVIS effects |
| Hosting | GitHub Pages | Free, deploys from repo via GitHub Actions |
| Fonts | Monogram (game) + JetBrains Mono (UI) | Pixel-font for game, monospace for JARVIS UI |

---

## Visual Style

**Theme:** JARVIS HUD / Dark Sci-Fi
**Color palette:**
- Background: `#0a0e17` (deep navy), `#111827` (surface), `#1f2937` (elevated)
- Accent: `#00f0ff` (cyan), `rgba(0, 240, 255, 0.15)` (glow)
- Text: `#e2e8f0` (primary), `#94a3b8` (secondary), `#4ade80` (terminal green)

**UI effects:** Glassmorphism dialog boxes, neon glow, scanline overlay, typewriter text.

---

## Map Design

**Style reference:** Ash's bedroom from Pokemon Red/Blue (Game Boy).
**Tileset:** Free sci-fi tileset from itch.io (dark palette, indoor/station environment, 16x16 tiles).
**Spritesheet:** Free sci-fi character from itch.io (4-direction walk + idle animations).

### Room Layout

```
┌────────────────────────────────────────┐
│ [Buecher-  [Terminal/  [Server-       │  <- Upper wall (interactive objects)
│  regal]     Monitor]    Rack]         │
│  ABOUT      PROJECTS    SKILLS        │
│                                        │
│         ┌──────────┐                  │
│         │Schreib-  │    [Poster]      │  <- Furniture in room
│         │tisch+PC  │                  │
│         └──────────┘                  │
│                                        │
│   * SPAWN        [Pflanze] [Kiste]    │  <- Decorative objects
│                                        │
│          ┌──────┐                      │
│          │ DOOR │                      │  <- CONTACT zone
└──────────┴──────┴──────────────────────┘
```

### Interactive Zones

| Zone | Object | Dialog ID | Content |
|---|---|---|---|
| ABOUT_ME | Bookshelf | `about` | Personal intro, background |
| SKILLS | Server rack | `skills` | Tech stack, skill matrix |
| PROJECTS | Terminal/monitors | `projects` | Project showcase with links |
| CONTACT | Door | `contact` | GitHub, Email, LinkedIn |

### Tiled Layer Structure

1. `ground` (Tile Layer) - floor tiles
2. `walls` (Tile Layer) - walls, furniture, decoration
3. `boundaries` (Object Layer) - invisible collision rectangles
4. `spawnpoints` (Object Layer) - player spawn point (name: `player`)
5. `interactions` (Object Layer) - interactive zone rectangles with `dialogId` property

---

## Player Movement

### Keyboard (Desktop)
- WASD + Arrow keys
- 4-directional movement
- Collision with boundaries via KAPLAY `body()` + `area()` components
- Walk animation per direction, idle on stop

### Click-to-Move (Desktop + Mobile)
- Click/tap target point on map
- A* pathfinding around obstacles
- Grid built from Tiled boundaries layer (walkable/blocked tiles)
- Player follows waypoint path
- Separate module: `systems/pathfinding.js`

### Mobile D-Pad
- 4 directional buttons (up/down/left/right)
- JARVIS-styled glassmorphism buttons
- Visible only on touch devices (`@media (pointer: coarse)`)
- `touch-action: manipulation` to prevent browser zoom

### Animation States
- `idle-down` (default on spawn)
- `walk-up`, `walk-down`, `walk-left`, `walk-right`
- On stop: idle facing last direction

---

## Interaction System

### Flow
1. Player approaches interactive object
2. Visual hint appears: "ENTER" (desktop) / "TAP" (mobile)
3. Player activates (Enter key / tap)
4. Dialog box opens (HTML overlay)
5. Player movement locked
6. Typewriter effect displays text (40ms/char)
7. Click/Enter = show full text immediately
8. ESC / Close button / click outside = close dialog
9. Player movement unlocked

### Dialog Box (HTML Overlay)
- Positioned over canvas as HTML `<div>`
- JARVIS glassmorphism design (backdrop-filter blur, cyan glow border)
- Title bar with terminal prompt style: `> ABOUT_ME.exe`
- Typewriter text effect with blinking cursor
- Scanline overlay (subtle)
- Rich HTML content: clickable links, styled text
- Close button (red, top-right)
- Responsive: `min(90vw, 600px)` width

**Why HTML overlay (not canvas text):**
- Real clickable links (GitHub, LinkedIn, email)
- Native CSS glassmorphism/backdrop-filter
- Sharper text rendering
- Screen reader accessible

---

## Camera System

- Smooth follow with lerp: `current.lerp(target, dt() * 5)`
- Stays within map bounds
- Responsive canvas scaling via KAPLAY `letterbox: true`

---

## Project Structure

```
portfolio-game/
├── public/
│   ├── map.json              # Tiled map export
│   ├── tileset.png           # Sci-fi tileset
│   ├── spritesheet.png       # Character spritesheet
│   ├── monogram.ttf          # Pixel font
│   └── fonts/
│       └── JetBrainsMono.woff2
├── src/
│   ├── main.js               # KAPLAY init, scene setup
│   ├── constants.js           # Dialog texts, colors, config
│   ├── scenes/
│   │   └── gameScene.js       # Main game scene
│   ├── entities/
│   │   └── player.js          # Player entity
│   ├── systems/
│   │   ├── dialogSystem.js    # Dialog box logic
│   │   ├── cameraSystem.js    # Camera follow + bounds
│   │   ├── interactionSystem.js # Zone detection
│   │   └── pathfinding.js     # A* pathfinding
│   └── utils/
│       ├── mapLoader.js       # Tiled JSON parser
│       └── mobileControls.js  # Touch D-pad
├── index.html
├── style.css                  # JARVIS design system
├── package.json
├── vite.config.js
└── .gitignore
```

---

## Build Stages

| Stage | Deliverable | Testable Result |
|---|---|---|
| 1 | Project setup (Vite + KAPLAY) | `npm run dev` shows empty canvas with JARVIS background |
| 2 | Tileset + Map | Sci-fi room renders in browser |
| 3 | Player + keyboard movement | Character walks with WASD, collides with walls |
| 4 | Click-to-move + A* pathfinding | Click point, character navigates around obstacles |
| 5 | Camera + responsive scaling | Game scales to any window size, smooth camera follow |
| 6 | Interaction zones + dialog system | Interact with bookshelf, JARVIS dialog with typewriter text |
| 7 | JARVIS UI polish | Glassmorphism, glow effects, scanlines, loading screen |
| 8 | Mobile D-pad + touch | Playable on phone with touch buttons |
| 9 | Real content + meta tags | Actual texts, links, favicon, OG tags |
| 10 | GitHub Pages deploy | Live at username.github.io/portfolio-game |

---

## Key Decisions

1. **KAPLAY over Kaboom.js** - Active fork, same API, better maintained
2. **HTML overlay for dialogs** - Real links, CSS effects, accessibility
3. **A* pathfinding for click-to-move** - Polish over simplicity
4. **Pokemon-style room layout** - Compact, familiar, full of interactable objects
5. **Sci-fi tileset from itch.io** - Authentic dark aesthetic without creating art from scratch
6. **No TypeScript for V1** - Ship faster, migrate later if needed

## V2 Ideas (Post-Launch)

- Sound effects (footsteps, dialog open, ambient)
- Weather/day-night cycle
- NPC characters
- Mini-games in zones
- Custom sci-fi tileset
- Multiple rooms
- CMS integration
- Analytics
- i18n (DE/EN)
- Easter eggs
