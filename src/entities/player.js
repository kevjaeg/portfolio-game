import { SCALE_FACTOR, PLAYER_SPEED } from "../constants.js";

export function createPlayer(k, spawnpoint, mapPos) {
  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({ shape: new k.Rect(k.vec2(0, 3), 10, 10) }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(SCALE_FACTOR),
    {
      speed: PLAYER_SPEED,
      direction: "down",
      isInDialogue: false,
    },
    "player",
  ]);

  player.pos = k.vec2(
    (mapPos.x + spawnpoint.x) * SCALE_FACTOR,
    (mapPos.y + spawnpoint.y) * SCALE_FACTOR
  );

  k.add(player);
  return player;
}

export function setupKeyboardMovement(k, player) {
  function stopAnims() {
    if (player.direction === "down") player.play("idle-down");
    else if (player.direction === "up") player.play("idle-up");
    else player.play("idle-side");
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

    // Only one direction at a time
    if (keys.filter(Boolean).length > 1) return;

    if (keys[0]) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      player.move(player.speed, 0);
    } else if (keys[1]) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
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

export function setupClickToMove(k, player, pathfindingGrid) {
  let currentPath = null;
  let pathIndex = 0;

  function stopAnims() {
    if (player.direction === "down") player.play("idle-down");
    else if (player.direction === "up") player.play("idle-up");
    else player.play("idle-side");
  }

  function getDirection(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
    return dy > 0 ? "down" : "up";
  }

  function playWalkAnim(dir) {
    if (dir === "left" || dir === "right") {
      player.flipX = dir === "left";
      if (player.curAnim() !== "walk-side") player.play("walk-side");
    } else if (dir === "up") {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
    } else {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
    }
    player.direction = dir;
  }

  k.onClick(() => {
    if (player.isInDialogue) return;
    const worldPos = k.toWorld(k.mousePos());
    const path = pathfindingGrid.findPath(
      player.pos.x,
      player.pos.y,
      worldPos.x,
      worldPos.y
    );
    if (path && path.length > 1) {
      currentPath = path;
      pathIndex = 1;
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
    const dir = getDirection({ x: player.pos.x, y: player.pos.y }, target);
    playWalkAnim(dir);
    player.moveTo(k.vec2(target.x, target.y), player.speed);
  });

  // Cancel pathfinding when keyboard is used
  k.onKeyDown(() => {
    currentPath = null;
  });
}
