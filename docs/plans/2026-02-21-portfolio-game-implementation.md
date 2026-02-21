# 2D Portfolio Game — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive 2D developer portfolio as a top-down game with JARVIS dark-mode aesthetic, click-to-move with A* pathfinding, and HTML dialog overlays.

**Architecture:** KAPLAY renders the game world on a `<canvas>`. The map is a pre-rendered PNG exported from Tiled; only the JSON is parsed at runtime for collisions, spawn points, and interaction zones. Dialogs are HTML `<div>` overlays with JARVIS glassmorphism styling. Communication between KAPLAY and HTML is via simple function calls (game triggers dialog open, dialog close re-enables input).

**Tech Stack:** KAPLAY 3001.x, Vite 6.x, JavaScript ES Modules, Tiled (map editor), Vanilla CSS, GitHub Pages

**Reference project:** `/tmp/2d-portfolio-kaboom/` (JSLegendDev tutorial, Kaboom.js version)

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `style.css`
- Create: `src/main.js`
- Create: `src/constants.js`
- Create: `.gitignore`
- Create: `public/` (empty dir with placeholder)

**Step 1: Initialize git repo**

```bash
cd C:/Users/kevin/dev/portfolio-game
git init
```

**Step 2: Create package.json**

```json
{
  "name": "portfolio-game",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Step 3: Install dependencies**

```bash
npm install kaplay
npm install -D vite
```

**Step 4: Create vite.config.js**

```js
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    minify: "terser",
  },
});
```

**Step 5: Create .gitignore**

```
node_modules
dist
.DS_Store
*.local
```

**Step 6: Create index.html**

Minimal HTML with:
- `<canvas id="game">` for KAPLAY
- `<div id="dialog-container">` for JARVIS dialog overlay (hidden by default)
- `<div id="mobile-controls">` for D-pad (hidden by default, shown on touch devices)
- Viewport meta tag with `user-scalable=no`
- Link to `style.css`
- Module script pointing to `src/main.js`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <title>Kevin | Developer Portfolio</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <div id="app">
    <canvas id="game"></canvas>

    <!-- JARVIS Dialog Overlay -->
    <div id="dialog-container" style="display: none">
      <div class="dialog-box">
        <div class="title-bar">
          <span class="title" id="dialog-title">> LOADING...</span>
          <button class="close-btn" id="dialog-close">✕</button>
        </div>
        <div class="content" id="dialog-content">
          <span class="cursor"></span>
        </div>
      </div>
    </div>

    <!-- Mobile D-Pad -->
    <div id="mobile-controls" class="mobile-controls">
      <button class="mobile-btn" id="btn-up">▲</button>
      <div class="mobile-row">
        <button class="mobile-btn" id="btn-left">◄</button>
        <button class="mobile-btn" id="btn-down">▼</button>
        <button class="mobile-btn" id="btn-right">►</button>
      </div>
    </div>

    <!-- Interaction Hint -->
    <div id="interaction-hint" class="interaction-hint" style="display: none">
      ENTER ↵
    </div>
  </div>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**Step 7: Create style.css**

Start with the JARVIS CSS custom properties (color palette) from the design doc, plus basic body/canvas reset:

```css
@font-face {
  font-family: "monogram";
  src: url("/monogram.ttf");
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-deep: #0a0e17;
  --bg-surface: #111827;
  --bg-elevated: #1f2937;
  --accent-primary: #00f0ff;
  --accent-glow: rgba(0, 240, 255, 0.15);
  --accent-border: rgba(0, 240, 255, 0.3);
  --accent-secondary: #7c3aed;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-accent: #00f0ff;
  --text-terminal: #4ade80;
  --glass-bg: rgba(17, 24, 39, 0.85);
  --glass-border: rgba(0, 240, 255, 0.2);
  --glass-blur: 20px;
  --shadow-glow: 0 0 30px rgba(0, 240, 255, 0.1);
  --shadow-neon: 0 0 10px rgba(0, 240, 255, 0.3), 0 0 20px rgba(0, 240, 255, 0.1);
}

body {
  background: var(--bg-deep);
  overflow: hidden;
  font-family: "JetBrains Mono", monospace;
  -webkit-font-smoothing: antialiased;
}

#app {
  width: 100vw;
  height: 100vh;
  position: relative;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

**Step 8: Create src/constants.js**

```js
export const SCALE_FACTOR = 4;
export const PLAYER_SPEED = 250;
export const DIALOG_SPEED = 40; // ms per character

export const DIALOGS = {
  about: {
    title: "ABOUT_ME.exe",
    content: "Placeholder about text...",
  },
  skills: {
    title: "SKILL_MATRIX.dat",
    content: "Placeholder skills...",
  },
  projects: {
    title: "PROJECT_DB.sql",
    content: "Placeholder projects...",
  },
  contact: {
    title: "COMM_CHANNEL.io",
    content: "Placeholder contact...",
  },
};
```

**Step 9: Create src/main.js**

Minimal KAPLAY init that proves the engine works:

```js
import kaplay from "kaplay";
import { SCALE_FACTOR } from "./constants.js";

const k = kaplay({
  global: false,
  touchToMouse: true,
  canvas: document.getElementById("game"),
  debug: true,
  background: [10, 14, 23], // --bg-deep as RGB
});

k.scene("main", () => {
  // Placeholder: colored rectangle to prove it works
  k.add([
    k.rect(100, 100),
    k.pos(k.center()),
    k.anchor("center"),
    k.color(0, 240, 255),
  ]);
});

k.go("main");
```

**Step 10: Create public/ directory with placeholder**

```bash
mkdir -p public
```

Copy `monogram.ttf` font file into `public/` (download from the reference project or Google Fonts).

**Step 11: Run and verify**

```bash
npm run dev
```

Expected: Browser shows dark navy background (`#0a0e17`) with a cyan rectangle in the center. No errors in console.

**Step 12: Commit**

```bash
git add package.json vite.config.js index.html style.css src/main.js src/constants.js .gitignore public/
git commit -m "feat: initial project setup with KAPLAY + Vite"
```

---

## Task 2: Find & Integrate Assets (Tileset + Spritesheet)

**This task requires user decisions — pause and present options.**

**Files:**
- Add: `public/map.png` (pre-rendered map image)
- Add: `public/map.json` (Tiled JSON for collision/interaction data)
- Add: `public/spritesheet.png` (character spritesheet)
- Add: `public/monogram.ttf` (pixel font)

**Step 1: Find a sci-fi tileset on itch.io**

Search itch.io for free sci-fi tilesets. Requirements:
- Dark palette (navy, black, gray, cyan accents)
- Indoor/station/lab environment
- 16x16 pixel tiles
- Free for personal use (check license)
- Top-down perspective

Good candidates to check:
- "Modern Interiors" by LimeZu (has dark/sci-fi variants)
- "Sci-Fi Tileset" collections
- Search: https://itch.io/game-assets/tag-sci-fi/tag-tileset

**Present 2-3 options to the user with screenshots/links. User picks one.**

**Step 2: Find a character spritesheet**

Requirements:
- Top-down perspective
- Idle + walk animations (4 directions: up, down, left, right)
- 16x16 or 32x32 pixel size per frame
- Sci-fi or modern look
- Free for personal use

Search: https://itch.io/game-assets/tag-character/tag-sci-fi

**Present 2-3 options to the user. User picks one.**

**Step 3: Download the Monogram font**

```bash
# Download from the reference project or dafont.com
# Place as public/monogram.ttf
```

**Step 4: Design the map in Tiled**

Open Tiled, create new map:
- Tile size: 16x16 (or match the tileset)
- Map size: ~27x20 tiles (adjust to fit Pokemon bedroom layout)
- Orientation: Orthogonal

Create layers in this order:
1. `ground` (Tile Layer) — floor tiles
2. `walls` (Tile Layer) — walls, bookshelf, desk, server rack, door, plants, boxes
3. `boundaries` (Object Layer) — invisible rectangles over all impassable objects
4. `spawnpoints` (Object Layer) — single point named `player` in the open floor area
5. `interactions` (Object Layer) — rectangles in front of interactive objects:
   - Rectangle named `about` in front of bookshelf, custom property `dialogId` = `about`
   - Rectangle named `skills` in front of server rack, custom property `dialogId` = `skills`
   - Rectangle named `projects` in front of terminal/monitors, custom property `dialogId` = `projects`
   - Rectangle named `contact` at the door, custom property `dialogId` = `contact`

**Step 5: Export from Tiled**

Export as:
1. **Image** → `public/map.png` (File > Export As Image)
2. **JSON** → `public/map.json` (File > Export As > JSON map)
   - Ensure "Embed Tilesets" is checked

**Step 6: Verify assets exist**

```bash
ls public/
# Expected: map.png, map.json, spritesheet.png, monogram.ttf
```

**Step 7: Commit**

```bash
git add public/
git commit -m "feat: add game assets (tileset, spritesheet, map, font)"
```

---

## Task 3: Map Rendering + Collision Boundaries

**Files:**
- Create: `src/utils/mapLoader.js`
- Modify: `src/main.js`

**Step 1: Create src/utils/mapLoader.js**

This module loads the map image and parses the Tiled JSON to create collision boundaries and interaction zones.

```js
import { SCALE_FACTOR } from "../constants.js";

export function loadAssets(k) {
  k.loadSprite("map", "./map.png");
}

export async function loadMap(k) {
  const mapData = await (await fetch("./map.json")).json();
  const map = k.add([k.sprite("map"), k.pos(0), k.scale(SCALE_FACTOR)]);

  const result = {
    map,
    boundaries: [],
    spawnpoints: {},
    interactions: [],
  };

  for (const layer of mapData.layers) {
    if (layer.name === "boundaries") {
      for (const obj of layer.objects) {
        const boundary = map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), obj.width, obj.height),
          }),
          k.body({ isStatic: true }),
          k.pos(obj.x, obj.y),
          "boundary",
        ]);
        result.boundaries.push(boundary);
      }
    }

    if (layer.name === "spawnpoints") {
      for (const obj of layer.objects) {
        result.spawnpoints[obj.name] = { x: obj.x, y: obj.y };
      }
    }

    if (layer.name === "interactions") {
      for (const obj of layer.objects) {
        const zone = map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), obj.width, obj.height),
            isSensor: true,
          }),
          k.pos(obj.x, obj.y),
          "interaction",
          { dialogId: obj.name },
        ]);
        result.interactions.push(zone);
      }
    }
  }

  return result;
}
```

**Step 2: Update src/main.js to load and display the map**

```js
import kaplay from "kaplay";
import { SCALE_FACTOR } from "./constants.js";
import { loadAssets, loadMap } from "./utils/mapLoader.js";

const k = kaplay({
  global: false,
  touchToMouse: true,
  canvas: document.getElementById("game"),
  debug: true,
  background: [10, 14, 23],
});

loadAssets(k);

k.scene("main", async () => {
  const { map, boundaries, spawnpoints, interactions } = await loadMap(k);

  // Placeholder: log loaded data
  console.log("Map loaded. Spawnpoints:", spawnpoints);
  console.log("Boundaries:", boundaries.length);
  console.log("Interactions:", interactions.length);
});

k.go("main");
```

**Step 3: Run and verify**

```bash
npm run dev
```

Expected: The sci-fi room map renders in the browser, scaled up 4x. Console logs show spawn point coordinates, boundary count, and interaction zone count. No errors.

**Step 4: Commit**

```bash
git add src/utils/mapLoader.js src/main.js
git commit -m "feat: load Tiled map with boundaries and interaction zones"
```

---

## Task 4: Player Entity + Keyboard Movement

**Files:**
- Create: `src/entities/player.js`
- Modify: `src/main.js`

**Step 1: Determine spritesheet layout**

Before writing code, examine the downloaded spritesheet:
- How many columns (sliceX) and rows (sliceY)?
- Which frame indices correspond to idle-down, walk-down, idle-side, walk-side, idle-up, walk-up?

**This may require manual inspection of the spritesheet image. Document the frame indices here before proceeding.**

**Step 2: Create src/entities/player.js**

```js
import { SCALE_FACTOR, PLAYER_SPEED } from "../constants.js";

export function createPlayer(k, spawnpoint, mapPos) {
  // NOTE: Update sliceX, sliceY, and anim frame indices to match your spritesheet
  k.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 4, // ADJUST to your spritesheet
    sliceY: 4, // ADJUST to your spritesheet
    anims: {
      "idle-down": 0,
      "walk-down": { from: 0, to: 3, loop: true, speed: 8 },
      "idle-up": 4,
      "walk-up": { from: 4, to: 7, loop: true, speed: 8 },
      "idle-left": 8,
      "walk-left": { from: 8, to: 11, loop: true, speed: 8 },
      "idle-right": 12,
      "walk-right": { from: 12, to: 15, loop: true, speed: 8 },
    },
  });

  const player = k.add([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({ shape: new k.Rect(k.vec2(0, 3), 10, 10) }),
    k.body(),
    k.anchor("center"),
    k.pos(
      (mapPos.x + spawnpoint.x) * SCALE_FACTOR,
      (mapPos.y + spawnpoint.y) * SCALE_FACTOR
    ),
    k.scale(SCALE_FACTOR),
    {
      speed: PLAYER_SPEED,
      direction: "down",
      isInDialogue: false,
    },
    "player",
  ]);

  return player;
}

export function setupKeyboardMovement(k, player) {
  function stopAnims() {
    if (player.direction === "down") player.play("idle-down");
    else if (player.direction === "up") player.play("idle-up");
    else if (player.direction === "left") player.play("idle-left");
    else if (player.direction === "right") player.play("idle-right");
  }

  k.onKeyRelease(stopAnims);

  k.onKeyDown(() => {
    if (player.isInDialogue) return;

    const keys = [
      k.isKeyDown("right") || k.isKeyDown("d"),
      k.isKeyDown("left") || k.isKeyDown("a"),
      k.isKeyDown("up") || k.isKeyDown("w"),
      k.isKeyDown("down") || k.isKeyDown("s"),
    ];

    // Only allow one direction at a time
    if (keys.filter(Boolean).length > 1) return;

    if (keys[0]) {
      if (player.curAnim() !== "walk-right") player.play("walk-right");
      player.direction = "right";
      player.move(player.speed, 0);
    } else if (keys[1]) {
      if (player.curAnim() !== "walk-left") player.play("walk-left");
      player.direction = "left";
      player.move(-player.speed, 0);
    } else if (keys[2]) {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.direction = "up";
      player.move(0, -player.speed);
    } else if (keys[3]) {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.direction = "down";
      player.move(0, player.speed);
    }
  });
}
```

NOTE: If the spritesheet only has 3 directional animations (down, up, side) like the reference project, use `flipX` for left/right instead of separate animations. Adjust accordingly.

**Step 3: Update src/main.js to spawn player and enable movement**

```js
import kaplay from "kaplay";
import { SCALE_FACTOR } from "./constants.js";
import { loadAssets, loadMap } from "./utils/mapLoader.js";
import { createPlayer, setupKeyboardMovement } from "./entities/player.js";

const k = kaplay({
  global: false,
  touchToMouse: true,
  canvas: document.getElementById("game"),
  debug: true,
  background: [10, 14, 23],
});

loadAssets(k);

k.scene("main", async () => {
  const { map, boundaries, spawnpoints, interactions } = await loadMap(k);

  const player = createPlayer(k, spawnpoints.player, map.pos);
  setupKeyboardMovement(k, player);

  // Temporary: center camera on player
  k.onUpdate(() => {
    k.setCamPos(player.worldPos().x, player.worldPos().y);
  });
});

k.go("main");
```

**Step 4: Run and verify**

```bash
npm run dev
```

Expected: Character spawns at the defined spawn point. WASD/arrow keys move the character. Walking into walls/furniture stops movement. Walk animations play in the correct direction.

**Step 5: Commit**

```bash
git add src/entities/player.js src/main.js
git commit -m "feat: add player entity with keyboard movement and collision"
```

---

## Task 5: Camera System + Responsive Scaling

**Files:**
- Create: `src/systems/cameraSystem.js`
- Modify: `src/main.js`

**Step 1: Create src/systems/cameraSystem.js**

```js
export function setupCamera(k, player) {
  // Responsive scaling based on aspect ratio
  function updateCamScale() {
    const resizeFactor = k.width() / k.height();
    if (resizeFactor < 1) {
      k.setCamScale(k.vec2(1));
    } else {
      k.setCamScale(k.vec2(1.5));
    }
  }

  updateCamScale();
  k.onResize(updateCamScale);

  // Smooth camera follow
  k.onUpdate(() => {
    k.setCamPos(player.worldPos().x, player.worldPos().y - 100);
  });
}
```

NOTE: The `-100` Y offset centers the view slightly above the player (common in top-down games so you see more of what's ahead). Adjust this value based on how it feels with the actual map.

**Step 2: Update src/main.js**

Replace the temporary camera code with:

```js
import { setupCamera } from "./systems/cameraSystem.js";

// Inside scene, after creating player:
setupCamera(k, player);
```

Remove the `k.onUpdate(() => { k.setCamPos(...) })` that was there before.

**Step 3: Run and verify**

- Resize browser window: game should scale appropriately
- Camera should follow the player smoothly
- On portrait-oriented windows (mobile), zoom should be less aggressive

**Step 4: Commit**

```bash
git add src/systems/cameraSystem.js src/main.js
git commit -m "feat: add responsive camera system with smooth follow"
```

---

## Task 6: A* Pathfinding + Click-to-Move

**Files:**
- Create: `src/systems/pathfinding.js`
- Modify: `src/entities/player.js`
- Modify: `src/main.js`

**Step 1: Create src/systems/pathfinding.js**

Implements A* pathfinding on a tile grid. The grid is built from the Tiled boundaries layer.

```js
export class PathfindingGrid {
  constructor(mapWidth, mapHeight, tileSize, boundaries, scaleFactor) {
    this.tileSize = tileSize;
    this.scaleFactor = scaleFactor;
    this.cols = Math.ceil(mapWidth / tileSize);
    this.rows = Math.ceil(mapHeight / tileSize);

    // Initialize grid: 0 = walkable, 1 = blocked
    this.grid = Array.from({ length: this.rows }, () =>
      new Array(this.cols).fill(0)
    );

    // Mark boundary tiles as blocked
    for (const b of boundaries) {
      const startCol = Math.floor(b.x / tileSize);
      const startRow = Math.floor(b.y / tileSize);
      const endCol = Math.ceil((b.x + b.width) / tileSize);
      const endRow = Math.ceil((b.y + b.height) / tileSize);

      for (let r = startRow; r < endRow && r < this.rows; r++) {
        for (let c = startCol; c < endCol && c < this.cols; c++) {
          if (r >= 0 && c >= 0) this.grid[r][c] = 1;
        }
      }
    }
  }

  worldToTile(worldX, worldY) {
    return {
      col: Math.floor(worldX / (this.tileSize * this.scaleFactor)),
      row: Math.floor(worldY / (this.tileSize * this.scaleFactor)),
    };
  }

  tileToWorld(col, row) {
    return {
      x: (col + 0.5) * this.tileSize * this.scaleFactor,
      y: (row + 0.5) * this.tileSize * this.scaleFactor,
    };
  }

  isWalkable(col, row) {
    return (
      col >= 0 &&
      row >= 0 &&
      col < this.cols &&
      row < this.rows &&
      this.grid[row][col] === 0
    );
  }

  findPath(startX, startY, endX, endY) {
    const start = this.worldToTile(startX, startY);
    const end = this.worldToTile(endX, endY);

    if (!this.isWalkable(end.col, end.row)) return null;

    const openSet = [{ ...start, g: 0, h: 0, f: 0, parent: null }];
    const closedSet = new Set();
    const key = (c, r) => `${c},${r}`;

    openSet[0].h = Math.abs(end.col - start.col) + Math.abs(end.row - start.row);
    openSet[0].f = openSet[0].h;

    while (openSet.length > 0) {
      // Find node with lowest f
      let currentIdx = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIdx].f) currentIdx = i;
      }
      const current = openSet.splice(currentIdx, 1)[0];

      if (current.col === end.col && current.row === end.row) {
        // Reconstruct path
        const path = [];
        let node = current;
        while (node) {
          const world = this.tileToWorld(node.col, node.row);
          path.unshift(world);
          node = node.parent;
        }
        return path;
      }

      closedSet.add(key(current.col, current.row));

      // Check 4 neighbors (up, down, left, right)
      const neighbors = [
        { col: current.col, row: current.row - 1 },
        { col: current.col, row: current.row + 1 },
        { col: current.col - 1, row: current.row },
        { col: current.col + 1, row: current.row },
      ];

      for (const n of neighbors) {
        if (!this.isWalkable(n.col, n.row)) continue;
        if (closedSet.has(key(n.col, n.row))) continue;

        const g = current.g + 1;
        const h = Math.abs(end.col - n.col) + Math.abs(end.row - n.row);
        const f = g + h;

        const existing = openSet.find(
          (o) => o.col === n.col && o.row === n.row
        );
        if (existing && g >= existing.g) continue;

        if (existing) {
          existing.g = g;
          existing.f = f;
          existing.parent = current;
        } else {
          openSet.push({ ...n, g, h, f, parent: current });
        }
      }
    }

    return null; // No path found
  }
}
```

**Step 2: Add click-to-move to player.js**

Add a new function `setupClickToMove` in `src/entities/player.js`:

```js
export function setupClickToMove(k, player, pathfindingGrid) {
  let currentPath = null;
  let pathIndex = 0;

  function stopAnims() {
    if (player.direction === "down") player.play("idle-down");
    else if (player.direction === "up") player.play("idle-up");
    else if (player.direction === "left") player.play("idle-left");
    else if (player.direction === "right") player.play("idle-right");
  }

  function getDirection(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? "right" : "left";
    }
    return dy > 0 ? "down" : "up";
  }

  function playWalkAnim(dir) {
    const anim = `walk-${dir}`;
    if (player.curAnim() !== anim) player.play(anim);
    player.direction = dir;
  }

  k.onClick(() => {
    if (player.isInDialogue) return;

    const worldPos = k.toWorld(k.mousePos());
    const path = pathfindingGrid.findPath(
      player.pos.x, player.pos.y,
      worldPos.x, worldPos.y
    );

    if (path && path.length > 1) {
      currentPath = path;
      pathIndex = 1; // Skip first point (current position)
    }
  });

  k.onUpdate(() => {
    if (!currentPath || player.isInDialogue) return;

    if (pathIndex >= currentPath.length) {
      currentPath = null;
      stopAnims();
      return;
    }

    const target = currentPath[pathIndex];
    const dist = player.pos.dist(k.vec2(target.x, target.y));

    if (dist < 5) {
      pathIndex++;
      if (pathIndex >= currentPath.length) {
        currentPath = null;
        stopAnims();
      }
      return;
    }

    const dir = getDirection(
      { x: player.pos.x, y: player.pos.y },
      target
    );
    playWalkAnim(dir);
    player.moveTo(k.vec2(target.x, target.y), player.speed);
  });

  // Cancel pathfinding when keyboard is used
  k.onKeyDown(() => {
    currentPath = null;
  });
}
```

**Step 3: Update main.js to initialize pathfinding**

```js
import { PathfindingGrid } from "./systems/pathfinding.js";
import { createPlayer, setupKeyboardMovement, setupClickToMove } from "./entities/player.js";

// Inside scene, after loadMap:
// Build pathfinding grid from raw boundary data in map JSON
const mapData = await (await fetch("./map.json")).json();
const boundaryLayer = mapData.layers.find((l) => l.name === "boundaries");
const rawBoundaries = boundaryLayer ? boundaryLayer.objects : [];
const tileSize = mapData.tilewidth;

const pathfindingGrid = new PathfindingGrid(
  mapData.width * tileSize,
  mapData.height * tileSize,
  tileSize,
  rawBoundaries,
  SCALE_FACTOR
);

const player = createPlayer(k, spawnpoints.player, map.pos);
setupKeyboardMovement(k, player);
setupClickToMove(k, player, pathfindingGrid);
```

**Step 4: Run and verify**

- Click on an open area → character walks there via path
- Click behind furniture → character walks around it
- Click on a wall → nothing happens (no valid path)
- Press WASD while path-walking → cancels pathfinding, keyboard takes over

**Step 5: Commit**

```bash
git add src/systems/pathfinding.js src/entities/player.js src/main.js
git commit -m "feat: add A* pathfinding for click-to-move"
```

---

## Task 7: Interaction Zones + Dialog System

**Files:**
- Create: `src/systems/interactionSystem.js`
- Create: `src/systems/dialogSystem.js`
- Modify: `src/main.js`
- Modify: `style.css` (add dialog styles)

**Step 1: Create src/systems/dialogSystem.js**

```js
import { DIALOG_SPEED, DIALOGS } from "../constants.js";

let isOpen = false;
let typewriterInterval = null;

export function openDialog(dialogId, onClose) {
  const data = DIALOGS[dialogId];
  if (!data || isOpen) return;

  isOpen = true;
  const container = document.getElementById("dialog-container");
  const title = document.getElementById("dialog-title");
  const content = document.getElementById("dialog-content");
  const closeBtn = document.getElementById("dialog-close");

  container.style.display = "flex";
  title.textContent = `> ${data.title}`;
  content.innerHTML = "";

  // Typewriter effect
  let charIndex = 0;
  const fullText = data.content;
  const tempDiv = document.createElement("div");

  typewriterInterval = setInterval(() => {
    if (charIndex < fullText.length) {
      tempDiv.innerHTML = fullText.substring(0, charIndex + 1);
      content.innerHTML = tempDiv.innerHTML + '<span class="cursor"></span>';
      charIndex++;
    } else {
      clearInterval(typewriterInterval);
      typewriterInterval = null;
      content.innerHTML = fullText + '<span class="cursor"></span>';
    }
  }, DIALOG_SPEED);

  // Skip typewriter on click
  function skipTypewriter() {
    if (typewriterInterval) {
      clearInterval(typewriterInterval);
      typewriterInterval = null;
      content.innerHTML = fullText + '<span class="cursor"></span>';
    }
  }

  content.addEventListener("click", skipTypewriter, { once: false });

  // Close dialog
  function close() {
    isOpen = false;
    container.style.display = "none";
    content.innerHTML = "";
    if (typewriterInterval) clearInterval(typewriterInterval);
    closeBtn.removeEventListener("click", close);
    document.removeEventListener("keydown", handleKey);
    content.removeEventListener("click", skipTypewriter);
    if (onClose) onClose();
  }

  function handleKey(e) {
    if (e.key === "Escape") close();
    if (e.key === "Enter") {
      if (typewriterInterval) skipTypewriter();
      else close();
    }
  }

  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", handleKey);
}

export function isDialogOpen() {
  return isOpen;
}
```

**Step 2: Create src/systems/interactionSystem.js**

```js
import { openDialog, isDialogOpen } from "./dialogSystem.js";

export function setupInteractions(k, player, interactions) {
  const hint = document.getElementById("interaction-hint");
  let currentZone = null;

  for (const zone of interactions) {
    player.onCollide(zone, () => {
      currentZone = zone.dialogId;
      if (!isDialogOpen()) {
        hint.style.display = "block";
      }
    });

    player.onCollideEnd(zone, () => {
      if (currentZone === zone.dialogId) {
        currentZone = null;
        hint.style.display = "none";
      }
    });
  }

  // Activate interaction with Enter key
  k.onKeyPress("enter", () => {
    if (currentZone && !isDialogOpen()) {
      hint.style.display = "none";
      player.isInDialogue = true;
      openDialog(currentZone, () => {
        player.isInDialogue = false;
      });
    }
  });

  // Also allow activating by clicking on the zone hint
  hint.addEventListener("click", () => {
    if (currentZone && !isDialogOpen()) {
      hint.style.display = "none";
      player.isInDialogue = true;
      openDialog(currentZone, () => {
        player.isInDialogue = false;
      });
    }
  });
}
```

NOTE: The collision detection between player and interaction zones depends on how KAPLAY handles sensor collisions. If `onCollide` doesn't fire for sensors, use `onCollideUpdate` and track enter/exit manually by comparing frames.

**Step 3: Add dialog styles to style.css**

Add the full JARVIS dialog CSS from the design document (the `.dialog-box`, `.title-bar`, `.close-btn`, `.content`, `.cursor`, `@keyframes dialogOpen`, `@keyframes blink`, scanline overlay). Also add the interaction hint styling:

```css
/* Interaction hint */
.interaction-hint {
  position: fixed;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--text-accent);
  font-family: "JetBrains Mono", monospace;
  font-size: 14px;
  animation: pulse 2s ease-in-out infinite;
  z-index: 50;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Dialog container */
#dialog-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
}

/* Full .dialog-box styles from design doc */
.dialog-box {
  width: min(90vw, 600px);
  max-height: 70vh;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: var(--shadow-glow), var(--shadow-neon);
  font-family: "JetBrains Mono", monospace;
  color: var(--text-primary);
  padding: 24px;
  animation: dialogOpen 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto;
  position: relative;
}

.dialog-box .title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--accent-border);
}

.dialog-box .title {
  color: var(--text-accent);
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.dialog-box .close-btn {
  width: 28px;
  height: 28px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;
}

.dialog-box .close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
}

.dialog-box .content {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.dialog-box .content a {
  color: var(--text-accent);
  text-decoration: none;
  border-bottom: 1px solid var(--accent-border);
  transition: border-color 0.2s;
}

.dialog-box .content a:hover {
  border-color: var(--accent-primary);
}

.dialog-box .content .highlight {
  color: var(--text-accent);
}

.cursor {
  display: inline-block;
  width: 8px;
  height: 16px;
  background: var(--text-terminal);
  animation: blink 1s step-end infinite;
  margin-left: 2px;
  vertical-align: text-bottom;
}

@keyframes dialogOpen {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes blink {
  50% { opacity: 0; }
}

/* Scanline overlay on dialog */
.dialog-box::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 240, 255, 0.01) 2px,
    rgba(0, 240, 255, 0.01) 4px
  );
  pointer-events: none;
  border-radius: 12px;
}
```

**Step 4: Update main.js to wire up interactions**

```js
import { setupInteractions } from "./systems/interactionSystem.js";

// Inside scene, after creating player:
setupInteractions(k, player, interactions);
```

**Step 5: Run and verify**

- Walk to bookshelf → "ENTER ↵" hint appears
- Press Enter → JARVIS dialog opens with typewriter effect
- Click content → typewriter skips to full text
- Press ESC or click close → dialog closes, player can move again
- Repeat for all 4 zones (about, skills, projects, contact)

**Step 6: Commit**

```bash
git add src/systems/dialogSystem.js src/systems/interactionSystem.js src/main.js style.css
git commit -m "feat: add interaction zones and JARVIS dialog system"
```

---

## Task 8: Mobile D-Pad Controls

**Files:**
- Create: `src/utils/mobileControls.js`
- Modify: `src/main.js`
- Modify: `style.css` (add mobile control styles)

**Step 1: Create src/utils/mobileControls.js**

```js
export function setupMobileControls(k, player) {
  const buttons = {
    up: document.getElementById("btn-up"),
    down: document.getElementById("btn-down"),
    left: document.getElementById("btn-left"),
    right: document.getElementById("btn-right"),
  };

  const activeDirections = new Set();

  function startMove(direction) {
    activeDirections.add(direction);
  }

  function stopMove(direction) {
    activeDirections.delete(direction);
    if (activeDirections.size === 0) {
      // Play idle animation
      if (player.direction === "down") player.play("idle-down");
      else if (player.direction === "up") player.play("idle-up");
      else if (player.direction === "left") player.play("idle-left");
      else if (player.direction === "right") player.play("idle-right");
    }
  }

  for (const [dir, btn] of Object.entries(buttons)) {
    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      startMove(dir);
    });
    btn.addEventListener("touchend", (e) => {
      e.preventDefault();
      stopMove(dir);
    });
    btn.addEventListener("touchcancel", (e) => {
      e.preventDefault();
      stopMove(dir);
    });
  }

  // Process active directions in game loop
  k.onUpdate(() => {
    if (player.isInDialogue || activeDirections.size === 0) return;
    if (activeDirections.size > 1) return; // One direction at a time

    const dir = [...activeDirections][0];
    const anim = `walk-${dir}`;
    if (player.curAnim() !== anim) player.play(anim);
    player.direction = dir;

    switch (dir) {
      case "right": player.move(player.speed, 0); break;
      case "left": player.move(-player.speed, 0); break;
      case "up": player.move(0, -player.speed); break;
      case "down": player.move(0, player.speed); break;
    }
  });
}
```

**Step 2: Add mobile control styles to style.css**

```css
.mobile-controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 100;
}

.mobile-row {
  display: flex;
  gap: 4px;
}

@media (pointer: coarse) {
  .mobile-controls {
    display: flex;
  }
}

.mobile-btn {
  width: 56px;
  height: 56px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-accent);
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;
}

.mobile-btn:active {
  background: rgba(0, 240, 255, 0.15);
  box-shadow: var(--shadow-neon);
}
```

**Step 3: Wire up in main.js**

```js
import { setupMobileControls } from "./utils/mobileControls.js";

// Inside scene, after creating player:
setupMobileControls(k, player);
```

**Step 4: Run and verify**

Test with Chrome DevTools mobile emulation (toggle device toolbar):
- D-pad buttons appear on touch devices
- Tapping directional buttons moves the player
- D-pad is hidden on desktop

**Step 5: Commit**

```bash
git add src/utils/mobileControls.js src/main.js style.css
git commit -m "feat: add mobile D-pad touch controls"
```

---

## Task 9: JARVIS UI Polish

**Files:**
- Modify: `style.css`
- Modify: `index.html`
- Add: `public/fonts/JetBrainsMono.woff2`

**Step 1: Download JetBrains Mono font**

Download JetBrains Mono woff2 from Google Fonts or JetBrains website. Place in `public/fonts/JetBrainsMono.woff2`.

Add `@font-face` to style.css:

```css
@font-face {
  font-family: "JetBrains Mono";
  src: url("/fonts/JetBrainsMono.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

**Step 2: Add loading screen**

Add to index.html before the `#app` div:

```html
<div id="loading-screen">
  <div class="loading-content">
    <div class="loading-title">INITIALIZING...</div>
    <div class="loading-bar">
      <div class="loading-fill"></div>
    </div>
    <div class="loading-text">Loading portfolio.exe</div>
  </div>
</div>
```

Add loading screen CSS to style.css:

```css
#loading-screen {
  position: fixed;
  inset: 0;
  background: var(--bg-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: opacity 0.5s ease;
}

#loading-screen.fade-out {
  opacity: 0;
  pointer-events: none;
}

.loading-content {
  text-align: center;
  font-family: "JetBrains Mono", monospace;
}

.loading-title {
  color: var(--text-accent);
  font-size: 24px;
  letter-spacing: 4px;
  margin-bottom: 24px;
}

.loading-bar {
  width: 200px;
  height: 2px;
  background: var(--bg-elevated);
  border-radius: 1px;
  overflow: hidden;
  margin: 0 auto 16px;
}

.loading-fill {
  height: 100%;
  background: var(--accent-primary);
  box-shadow: var(--shadow-neon);
  animation: loadingProgress 2s ease-in-out forwards;
}

.loading-text {
  color: var(--text-secondary);
  font-size: 12px;
}

@keyframes loadingProgress {
  from { width: 0; }
  to { width: 100%; }
}
```

**Step 3: Hide loading screen after assets load**

In main.js, after `k.go("main")`:

```js
k.onLoad(() => {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.classList.add("fade-out");
  setTimeout(() => loadingScreen.remove(), 500);
});
```

**Step 4: Run and verify**

- Loading screen appears with JARVIS-styled progress bar
- Fades out when game is ready
- Dialogs have glassmorphism, glow, scanlines
- JetBrains Mono font is used in dialogs
- Overall JARVIS dark-mode aesthetic is cohesive

**Step 5: Commit**

```bash
git add style.css index.html public/fonts/ src/main.js
git commit -m "style: add JARVIS loading screen and UI polish"
```

---

## Task 10: Real Content + Meta Tags

**Files:**
- Modify: `src/constants.js`
- Modify: `index.html`
- Add: `public/favicon.ico` (or .svg)
- Add: `public/og-image.png` (social sharing preview)

**Step 1: Update dialog content in constants.js**

**ASK THE USER for their real content:** name, bio, skills, projects, contact links. Then update each dialog entry in `DIALOGS` with the actual HTML content.

**Step 2: Add meta tags to index.html**

```html
<head>
  <!-- ... existing ... -->
  <link rel="icon" href="/favicon.ico" />
  <meta name="description" content="Kevin's interactive developer portfolio — explore a 2D game to discover my skills, projects, and contact info." />

  <!-- Open Graph -->
  <meta property="og:title" content="Kevin | Developer Portfolio" />
  <meta property="og:description" content="An interactive 2D game portfolio. Walk around, explore, and discover." />
  <meta property="og:image" content="/og-image.png" />
  <meta property="og:type" content="website" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Kevin | Developer Portfolio" />
  <meta name="twitter:description" content="An interactive 2D game portfolio." />
  <meta name="twitter:image" content="/og-image.png" />
</head>
```

**Step 3: Create og-image.png**

Take a screenshot of the game in action. Crop to 1200x630px for optimal social sharing.

**Step 4: Run and verify**

- All dialog texts show correct personal content
- Links in dialogs are clickable and open in new tabs
- Favicon appears in browser tab

**Step 5: Commit**

```bash
git add src/constants.js index.html public/favicon.ico public/og-image.png
git commit -m "feat: add real portfolio content and meta tags"
```

---

## Task 11: GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `vite.config.js` (base path for GitHub Pages)

**Step 1: Update vite.config.js base path**

```js
import { defineConfig } from "vite";

export default defineConfig({
  base: "/portfolio-game/", // Match your GitHub repo name
  build: {
    minify: "terser",
  },
});
```

NOTE: Also update any hardcoded asset paths in the code. Vite handles `import` paths automatically, but `fetch("./map.json")` in mapLoader.js may need adjustment. Consider using `import.meta.env.BASE_URL + "map.json"` instead.

**Step 2: Create GitHub Actions workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Step 3: Build locally and verify**

```bash
npm run build
npm run preview
```

Expected: Preview server shows the full game working correctly. All assets load. No broken paths.

**Step 4: Commit and push**

```bash
git add .github/workflows/deploy.yml vite.config.js
git commit -m "ci: add GitHub Pages deployment workflow"
```

**Step 5: Enable GitHub Pages**

Go to repo Settings > Pages > Source: "GitHub Actions". Push to main triggers the deploy.

**Step 6: Verify live deployment**

Visit `https://username.github.io/portfolio-game/` and verify everything works.

---

## Summary of All Tasks

| # | Task | Key Files |
|---|---|---|
| 1 | Project scaffolding | `package.json`, `vite.config.js`, `index.html`, `style.css`, `src/main.js`, `src/constants.js` |
| 2 | Find & integrate assets | `public/map.png`, `public/map.json`, `public/spritesheet.png` |
| 3 | Map rendering + collisions | `src/utils/mapLoader.js` |
| 4 | Player + keyboard movement | `src/entities/player.js` |
| 5 | Camera + responsive scaling | `src/systems/cameraSystem.js` |
| 6 | A* pathfinding + click-to-move | `src/systems/pathfinding.js` |
| 7 | Interaction zones + dialogs | `src/systems/dialogSystem.js`, `src/systems/interactionSystem.js` |
| 8 | Mobile D-pad controls | `src/utils/mobileControls.js` |
| 9 | JARVIS UI polish | `style.css`, `index.html` |
| 10 | Real content + meta tags | `src/constants.js`, `index.html` |
| 11 | GitHub Pages deploy | `.github/workflows/deploy.yml` |
