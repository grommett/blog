import { target } from './target.js';

export function mongoExport(ctx) {
  target(ctx, { x: 400, y: 400, radius: 600, circleCount: 4 });
  target(ctx, { x: 0, y: 0, radius: 200, circleCount: 4 });
  target(ctx, { x: 0, y: 400, radius: 200, circleCount: 4 });
  target(ctx, { x: 0, y: 20, radius: 200, circleCount: 4 });
  target(ctx, { x: 300, y: 100, radius: 100, circleCount: 4 });
  target(ctx, { x: 500, y: 100, radius: 100, circleCount: 4 });
  target(ctx, { x: 500, y: 500, radius: 100, circleCount: 2 });
}