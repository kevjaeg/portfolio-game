import { SCALE_FACTOR } from "../constants.js";

export function loadAssets(k) {
  k.loadSprite("map", "./map.png");
  k.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 39,
    sliceY: 31,
    anims: {
      "idle-down": 936,
      "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
      "idle-side": 975,
      "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
      "idle-up": 1014,
      "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
    },
  });
}

export async function loadMap(k) {
  const mapData = await (await fetch("./map.json")).json();
  const map = k.add([k.sprite("map"), k.pos(0), k.scale(SCALE_FACTOR)]);

  const result = {
    map,
    mapData,
    spawnpoints: {},
  };

  for (const layer of mapData.layers) {
    if (layer.name === "boundaries") {
      for (const obj of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), obj.width, obj.height),
          }),
          k.body({ isStatic: true }),
          k.pos(obj.x, obj.y),
          obj.name || "boundary",
        ]);
      }
    }

    if (layer.name === "spawnpoints") {
      for (const obj of layer.objects) {
        result.spawnpoints[obj.name] = { x: obj.x, y: obj.y };
      }
    }
  }

  return result;
}
