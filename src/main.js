import kaplay from "kaplay";
import { SCALE_FACTOR } from "./constants.js";
import { loadAssets, loadMap } from "./utils/mapLoader.js";
import { createPlayer, setupKeyboardMovement } from "./entities/player.js";
import { setupCamera } from "./systems/cameraSystem.js";

const k = kaplay({
  global: false,
  touchToMouse: true,
  canvas: document.getElementById("game"),
  debug: true,
  background: [10, 14, 23],
});

loadAssets(k);

k.scene("main", async () => {
  const { map, mapData, spawnpoints } = await loadMap(k);
  const player = createPlayer(k, spawnpoints.player, map.pos);

  setupKeyboardMovement(k, player);
  setupCamera(k, player);
});

k.go("main");
