import kaplay from "kaplay";
import { SCALE_FACTOR } from "./constants.js";

const k = kaplay({
  global: false,
  touchToMouse: true,
  canvas: document.getElementById("game"),
  debug: true,
  background: [10, 14, 23],
});

k.scene("main", () => {
  k.add([
    k.rect(100, 100),
    k.pos(k.center()),
    k.anchor("center"),
    k.color(0, 240, 255),
  ]);
});

k.go("main");
