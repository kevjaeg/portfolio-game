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
  title.textContent = "> " + data.title;
  content.innerHTML = "";

  let charIndex = 0;
  const fullText = data.content;

  typewriterInterval = setInterval(() => {
    if (charIndex < fullText.length) {
      content.innerHTML =
        fullText.substring(0, charIndex + 1) + '<span class="cursor"></span>';
      charIndex++;
    } else {
      clearInterval(typewriterInterval);
      typewriterInterval = null;
      content.innerHTML = fullText + '<span class="cursor"></span>';
    }
  }, DIALOG_SPEED);

  function skipTypewriter() {
    if (typewriterInterval) {
      clearInterval(typewriterInterval);
      typewriterInterval = null;
      content.innerHTML = fullText + '<span class="cursor"></span>';
    }
  }

  content.addEventListener("click", skipTypewriter);

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
