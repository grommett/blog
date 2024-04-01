import { target } from './target.js';
import { rectangle } from './rectangle.js';
import { randRange } from './utils.js';
import { circle } from './circle.js';
import { COLORS } from './color-palette.js';

export function cleanPromiseChains(ctx) {
  rectangle(ctx, {
    x: 0,
    y: 0,
    width: 600,
    height: 600,
    color: COLORS.PINK,
  });
  target(ctx, {
    x: 400,
    y: 400,
    radius: 300,
    circleCount: 5,
  });
  circle(ctx, {
    x: 0,
    y: 200,
    radius: 200,
    startAngle: Math.PI * 1.5,
    endAngle: 0,
    color: COLORS.BLACK,
  });
  circle(ctx, {
    x: 200,
    y: 200,
    radius: 200,
    startAngle: Math.PI * 1.5,
    endAngle: 0,
    color: COLORS.YELLOW,
  });
  circle(ctx, {
    x: 400,
    y: 200,
    radius: 200,
    startAngle: Math.PI * 1.5,
    endAngle: 0,
  });
  circle(ctx, {
    x: 200,
    y: 200,
    radius: 200,
    startAngle: Math.PI * 0.5,
    endAngle: Math.PI,
    color: COLORS.GRAY,
  });
  circle(ctx, {
    x: 400,
    y: 200,
    radius: 200,
    startAngle: Math.PI * 0.5,
    endAngle: Math.PI,
    color: COLORS.RED,
  });
  circle(ctx, {
    x: 600,
    y: 200,
    radius: 200,
    startAngle: Math.PI * 0.5,
    endAngle: Math.PI,
    color: COLORS.BLUE,
  });

  let totalLines = 30;
  let distribution = 590 / totalLines;
  let currentLine = 0;

  while (currentLine <= totalLines) {
    rectangle(ctx, {
      x: currentLine * distribution,
      y: 200,
      width:4,
      height: randRange(100, 400),
      alpha: .85,
    });
    currentLine += 1;
  }
  
  currentLine = 0;
  totalLines = 60;
  distribution = 590 / totalLines;

  while (currentLine <= totalLines) {
    const start = randRange(40, 150)
    rectangle(ctx, {
      x: currentLine * (distribution),
      y: start,
      width:5,
      height: 200 - start,
      alpha: .85,
    });
    currentLine += 1;
  }
}
