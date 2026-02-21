export function setupCamera(k, player) {
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

  k.onUpdate(() => {
    k.setCamPos(player.worldPos().x, player.worldPos().y - 100);
  });
}
