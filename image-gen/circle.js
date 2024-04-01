import { randomColor } from "./color-palette.js";
/**
 * Circle settings
 *
 * @typedef {object} CircleSettings
 * @prop {number} x The x value
 * @prop {number} y The y value
 * @prop {number} radius The radius value
 * @prop {number} startAngle The start angle value
 * @prop {number} endAngle The end angle value
 * @prop {string} [color] The end angle value
 * @prop {number} [alpha] The opacity
 */

/**
 * Draws a circle
 * @param {CanvasRenderingContext2D} ctx
 * @param {CircleSettings} setting
 */
export function circle(ctx, settings) {
  const { x, y, radius, startAngle = 0, endAngle = Math.PI * 2, color, alpha } = settings;
  setFillColor(ctx, color, alpha);
  ctx.beginPath();
  ctx.arc(x, y, radius, startAngle, endAngle);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();
}


function setFillColor(ctx, color, alpha) {
  ctx.fillStyle = color || randomColor(alpha);
}
