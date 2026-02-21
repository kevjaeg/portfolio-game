import { openDialog, isDialogOpen } from "./dialogSystem.js";
import { DIALOGS } from "../constants.js";

export function setupInteractions(k, player) {
  const hint = document.getElementById("interaction-hint");
  let currentZone = null;

  // For each dialog key, set up collision handlers
  for (const zoneName of Object.keys(DIALOGS)) {
    player.onCollide(zoneName, () => {
      currentZone = zoneName;
      if (!isDialogOpen()) {
        hint.style.display = "block";
      }
    });

    player.onCollideEnd(zoneName, () => {
      if (currentZone === zoneName) {
        currentZone = null;
        hint.style.display = "none";
      }
    });
  }

  k.onKeyPress("enter", () => {
    if (currentZone && !isDialogOpen()) {
      hint.style.display = "none";
      player.isInDialogue = true;
      openDialog(currentZone, () => {
        player.isInDialogue = false;
      });
    }
  });

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
