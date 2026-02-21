export function setupMobileControls(k, player) {
  const buttons = {
    up: document.getElementById("btn-up"),
    down: document.getElementById("btn-down"),
    left: document.getElementById("btn-left"),
    right: document.getElementById("btn-right"),
  };

  const activeDirections = new Set();

  function stopAnims() {
    if (player.direction === "down") player.play("idle-down");
    else if (player.direction === "up") player.play("idle-up");
    else player.play("idle-side");
  }

  function startMove(direction) {
    activeDirections.add(direction);
  }
  function stopMove(direction) {
    activeDirections.delete(direction);
    if (activeDirections.size === 0) stopAnims();
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

  k.onUpdate(() => {
    if (player.isInDialogue || activeDirections.size === 0) return;
    if (activeDirections.size > 1) return;

    const dir = [...activeDirections][0];
    if (dir === "left" || dir === "right") {
      player.flipX = dir === "left";
      if (player.curAnim() !== "walk-side") player.play("walk-side");
    } else if (dir === "up") {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
    } else {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
    }
    player.direction = dir;

    switch (dir) {
      case "right":
        player.move(player.speed, 0);
        break;
      case "left":
        player.move(-player.speed, 0);
        break;
      case "up":
        player.move(0, -player.speed);
        break;
      case "down":
        player.move(0, player.speed);
        break;
    }
  });
}
