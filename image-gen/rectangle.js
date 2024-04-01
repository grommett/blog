import { randomColor } from './color-palette.js';
/**
 * Rectangle settings
 *
 * @typedef {object} RectSettings
 * @prop {number} x The x value
 * @prop {number} y The y value
 * @prop {number} width The width value
 * @prop {number} height The height value
 * @prop {string?} [color] The color
 */

/**
 * Draws a rectangle
 * @param {CanvasRenderingContext2D} ctx
 * @param {RectSettings} setting
 */
export function rectangle(ctx, settings) {
  const { x, y, width, height, color, alpha } = settings;
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  setFillColor(ctx, color, alpha);
  ctx.fill();
}

function setFillColor(ctx, color, alpha) {
  ctx.fillStyle = color || randomColor(alpha);
}
