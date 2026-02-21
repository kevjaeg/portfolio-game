import kaplay from "kaplay";
import { SCALE_FACTOR } from "./constants.js";
import { loadAssets, loadMap } from "./utils/mapLoader.js";
import {
  createPlayer,
  setupKeyboardMovement,
  setupClickToMove,
} from "./entities/player.js";
import { setupCamera } from "./systems/cameraSystem.js";
import { PathfindingGrid } from "./systems/pathfinding.js";
import { setupInteractions } from "./systems/interactionSystem.js";
import { setupMobileControls } from "./utils/mobileControls.js";

const k = kaplay({
  global: false,
  touchToMouse: true,
  canvas: document.getElementById("game"),
  debug: true,
  background: [10, 14, 23],
});

loadAssets(k);

function dismissLoadingScreen() {
  const el = document.getElementById("loading-screen");
  if (el) {
    el.classList.add("fade-out");
    setTimeout(() => el.remove(), 500);
  }
}

k.scene("main", async () => {
  try {
    const { map, mapData, spawnpoints } = await loadMap(k);
    const player = createPlayer(k, spawnpoints.player, map.pos);

    // Build pathfinding grid from raw boundary data
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

    setupKeyboardMovement(k, player);
    setupClickToMove(k, player, pathfindingGrid);
    setupCamera(k, player);
    setupInteractions(k, player);
    setupMobileControls(k, player);

    dismissLoadingScreen();
  } catch (err) {
    console.error("Scene init error:", err);
    dismissLoadingScreen();
  }
});

k.go("main");
