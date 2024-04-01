import { randomColor } from './color-palette.js';
import { circle } from './circle.js';

export function target(ctx, targetSettings) {
  const { x, y, radius, circleCount, alpha } = targetSettings;
  const decrementBy = radius / circleCount;
  let currentCount = 0;
  
  while (currentCount <= circleCount) {
    circle(ctx, {
      x,
      y,
      radius: radius - (currentCount * decrementBy),
      startAngle: 0,
      endAngle: Math.PI * 2,
      alpha: alpha
    });
    currentCount += 1;
  }
}