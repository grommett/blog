import { randRange } from './utils.js';

export const _colors = [
  [0, 0, 0], // black
  [150, 150, 150], // gray
  [230, 50, 40], // red
  [20, 110, 170], // blue
  [0, 130, 90], // green
  [240, 200, 0], // yellow
  [240, 140, 40], // orange
  [248, 195, 189], // pink
];

export const colors = [
  [34, 30, 34], // black
  [150, 150, 150], // gray
  [230, 50, 40], // red
  [0, 67, 206], // blue
  [150, 197, 176], // green
  [236, 167, 44], // yellow
  [238, 86, 34], // orange
  [248, 195, 189], // pink
];

export const COLORS = {
  BLACK: `rgb(${colors[0]})`,
  GRAY: `rgb(${colors[1]})`,
  RED: `rgb(${colors[2]})`,
  BLUE: `rgb(${colors[3]})`,
  GREEN: `rgb(${colors[4]})`,
  YELLOW: `rgb(${colors[5]})`,
  ORANGE: `rgb(${colors[6]})`,
  PINK: `rgb(${colors[7]})`,
}

export function randomColor(alpha = 1) {
  const index = randRange(0, colors.length - 1);
  const color = colors[index];
  return `rgba(${color}, ${alpha})`;
}
