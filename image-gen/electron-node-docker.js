import { target } from './target.js';
import { rectangle } from './rectangle.js';
import { randRange } from './utils.js';
import { COLORS } from './color-palette.js';

export function electronNodeDocker(ctx) {
  target(ctx, { x: 300, y: 580, radius: 600, circleCount: 5 });
  const lineTotal = 11;
  const distribution = 590 / lineTotal;
  let currentLine = 0;
  
  while(currentLine <= lineTotal) {
    const width = randRange(2, 10);
    rectangle(ctx, {
      x: (currentLine * distribution),
      y: randRange(200, 300),
      width: width,
      height: 500,
      color: currentLine === 0 ? COLORS.BLUE : null,
    });
    currentLine += 1;
  }
}
