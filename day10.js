// @ts-check
// https://adventofcode.com/2018/day/10

const fs = require("fs");

const input = fs.readFileSync("inputs/day10.txt", "utf8");

const points = input
  .split("\n")
  .map(str =>
    str.match(
      /position=<[ ]*([-\d]+), [ ]*([-\d]+)> velocity=<[ ]*([-\d]+), [ ]*([-\d]*)>/
    )
  )
  .map(([, posX, posY, velX, velY]) => ({
    posX: +posX,
    posY: +posY,
    velX: +velX,
    velY: +velY
  }));

// Max time value. Mostly there to prevent endless loops in case something goes wrong.
const MAX_STEPS = 20000;

// These values may need to be modified slightly depending on input.
// If MAX_HEIGHT and MAX_WIDHT are small enough, only 1 result should show.
const MAX_HEIGHT = 12;
const MAX_WIDTH = 80;

let foundRightArea = false;
let time;

for (time = 1; time < MAX_STEPS; time++) {
  // Move all points
  points.forEach(movePoint);
  const maxX = Math.max(...points.map(point => point.posX));
  const minX = Math.min(...points.map(point => point.posX));
  const maxY = Math.max(...points.map(point => point.posY));
  const minY = Math.min(...points.map(point => point.posY));

  const xDifference = maxX - minX;
  const yDifference = maxY - minY;
  if (xDifference < MAX_WIDTH && yDifference < MAX_HEIGHT) {
    // Found a likely match
    const sky = getNewSky(xDifference, yDifference);
    points.forEach(point => addLightToSky(sky, point, -minX, -minY));
    foundRightArea = true;
    printSky(sky, time);
  } else if (foundRightArea) {
    // Points are moving away from each other again, stop execution
    break;
  }
}

function movePoint(point) {
  point.posX += point.velX;
  point.posY += point.velY;
}

function getNewSky(xLenght, yLength) {
  return Array.from({ length: yLength + 1 }, () =>
    Array.from({ length: xLenght + 1 }, () => ".")
  );
}

function addLightToSky(sky, point, xOffset, yOffset) {
  // Offsets are used to make indexing start from 0, regardless of point coordinates
  const x = xOffset + point.posX;
  const y = yOffset + point.posY;
  sky[y][x] = "#";
}

function printSky(sky, time) {
  console.log("Sky:");
  console.log(sky.map(row => row.join("")).join("\n"));
  console.log("Time:", time);
}
