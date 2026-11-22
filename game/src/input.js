// Keyboard + mouse input: held keys, edge-triggered presses, and click-to-move
// (clicks are converted to canvas coordinates, so the canvas can be scaled).

export function makeInput(canvas) {
  const input = { down: new Set(), pressed: new Set(), click: null };
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (!e.repeat) input.pressed.add(e.code);
    input.down.add(e.code);
  });
  window.addEventListener('keyup', (e) => input.down.delete(e.code));
  window.addEventListener('blur', () => input.down.clear());
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    input.click = {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  });
  return input;
}

// Call once per frame after the game has read the input.
export function endFrame(input) {
  input.pressed.clear();
  input.click = null;
}
