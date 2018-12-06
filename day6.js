// @ts-check
// https://adventofcode.com/2018/day/5

const fs = require("fs");
const { findMax, findAllMax } = require("./helpers");

const input = fs.readFileSync("inputs/day6.txt", "utf8");

// array of [index, x, y]
const coordinates = input
  .split("\n")
  .map(str => str.split(", "))
  .map(([x, y], index) => [index, +x, +y]);

const minX = findMax(coordinates, coord => -coord[1], -Infinity)[1];
const maxX = findMax(coordinates, coord => coord[1])[1];

const minY = findMax(coordinates, coord => -coord[2], -Infinity)[2];
const maxY = findMax(coordinates, coord => coord[2])[2];

const coordinateAreas = coordinates.map((_, i) => 0);
const edgeCoordinateIndexes = new Set();

for (let j = minY; j <= maxY; j++) {
  for (let i = minX; i <= maxX; i++) {
    const closestIndex = getClosestCoordinateIndex(coordinates, i, j);
    if (closestIndex !== -1) {
      coordinateAreas[closestIndex]++;
    }
    if (j === minY || j === maxY || i === minX || i === maxX) {
      // Edge coordinate, area is infinite for the coordinate area
      edgeCoordinateIndexes.add(closestIndex);
    }
  }
}

// Mark infinite areas as -1
edgeCoordinateIndexes.forEach(index => (coordinateAreas[index] = -1));

const largestArea = Math.max(...coordinateAreas);
console.log("Part 1", largestArea);

let regionSize = 0;

// Note: It's assumed that the "edges" are outside the 10000 total distance range
for (let j = minY; j <= maxY; j++) {
  for (let i = minX; i <= maxX; i++) {
    // This could be optimized by implementing a loop that would stop once 10000 limit has been
    // passed.
    const totalDistance = coordinates.reduce(
      (sum, [index, coordX, coordY]) => sum + getDistance(i, j, coordX, coordY),
      0
    );
    if (totalDistance < 10000) {
      regionSize++;
    }
  }
}

console.log("Part 2", regionSize);

function getClosestCoordinateIndex(coordinates, x, y) {
  const closest = findAllMax(
    coordinates,
    ([index, xCoord, yCoord]) => -getDistance(x, y, xCoord, yCoord),
    -Infinity
  );
  // If there are multiple at equal distance, -1 is returned
  return closest.length > 1 ? -1 : closest[0][0];
}

function getDistance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
