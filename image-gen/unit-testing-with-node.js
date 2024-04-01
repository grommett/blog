
import { target } from './target.js';
import { rectangle } from './rectangle.js';

export function unitTestingWithNode(ctx) {
  target(ctx, { x: 300, y: 150, radius: 400, circleCount: 5 });
  target(ctx, { x: 300, y: 690, radius: 400, circleCount: 3 });

  ctx.rotate(15 * Math.PI / 180)
  rectangle(ctx, {x: 295, y: 300, width: 10, height:500})
  target(ctx, { x: 300, y: 300, radius: 50, circleCount: 3 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  ctx.rotate(-25 * Math.PI / 180)
  rectangle(ctx, {x: 150, y: 400, width: 10, height:500})
  target(ctx, { x: 150, y: 400, radius: 50, circleCount: 4 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  ctx.rotate(-5 * Math.PI / 180)
  rectangle(ctx, {x: 5, y: 300, width: 10, height:500})
  target(ctx, { x: 0, y: 300, radius: 50, circleCount: 3 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  ctx.rotate(5 * Math.PI / 180)
  rectangle(ctx, {x: 595, y: 300, width: 10, height:500})
  target(ctx, { x: 600, y: 300, radius: 50, circleCount: 3 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}