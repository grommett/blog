import { circle } from './circle.js';
import { target } from './target.js';
import { rectangle } from './rectangle.js';
import { COLORS } from './color-palette.js';
import { randRange } from './utils.js';

export function serverSentEvents(ctx) {
  rectangle(ctx, {
    x: 0,
    y: 0,
    width: 600,
    height: 600,
    color: COLORS.BLACK,
  });

  const lineTotal = 150;
  const distribution = 590 / lineTotal;
  let currentLine = 0;

  while (currentLine <= lineTotal) {
    const width = randRange(2, 5);
    rectangle(ctx, {
      x: currentLine * distribution,
      y: 0,
      width: width,
      height: randRange(20, 580),
    });
    currentLine += 1;
  }
  ctx.globalCompositeOperation = 'destination-in';
  circle(ctx, {
    x: 300,
    y: 300,
    radius: 300,
  });

  ctx.globalCompositeOperation = 'destination-over';
  rectangle(ctx, {
    x: 0,
    y: 0,
    width: 600,
    height: 600,
    color: COLORS.YELLOW,
  });
}
