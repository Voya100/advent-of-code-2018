// @ts-check
// https://adventofcode.com/2018/day/11

const fs = require("fs");

const input = fs.readFileSync("inputs/day11.txt", "utf8");
const gridSerialNumber = +input;

const GRID_SIZE = 300;
const SQUARE_SIZE = 3;

const grid = Array.from({ length: GRID_SIZE }, (_, j) =>
  Array.from({ length: GRID_SIZE }, (_, i) => cellValue(i, j, gridSerialNumber))
);

// [Power, x, y]
let squareWithLargestPower = [-Infinity, 0, 0];
for (let j = 0; j <= GRID_SIZE - SQUARE_SIZE; j++) {
  for (let i = 0; i <= GRID_SIZE - SQUARE_SIZE; i++) {
    const power = squareSum(i, j, SQUARE_SIZE, grid);
    if (power > squareWithLargestPower[0]) {
      squareWithLargestPower = [power, i, j];
    }
  }
}

console.log(
  "Part 1",
  "x:",
  squareWithLargestPower[1] + 1,
  "y:",
  squareWithLargestPower[2] + 1,
  "power",
  squareWithLargestPower[0]
);

// [power, x, y, size]
squareWithLargestPower = [-Infinity, 0, 0, 1];

for (let j = 0; j <= GRID_SIZE - SQUARE_SIZE; j++) {
  for (let i = 0; i <= GRID_SIZE - SQUARE_SIZE; i++) {
    const maxSize = Math.min(GRID_SIZE - j, GRID_SIZE - i);
    const [, power, size] = biggestSquareSum(i, j, grid, maxSize);
    if (power > squareWithLargestPower[0]) {
      squareWithLargestPower = [power, i, j, size];
    }
  }
}

console.log(
  "Part 2",
  "x:",
  squareWithLargestPower[1] + 1,
  "y:",
  squareWithLargestPower[2] + 1,
  "size:",
  squareWithLargestPower[3],
  "power:",
  squareWithLargestPower[0]
);

function cellValue(x, y, gridSerialNumber) {
  // 0 indexing -> 1 added to coordinate
  const rackId = x + 1 + 10;
  let powerLevel = (y + 1) * rackId + gridSerialNumber;
  powerLevel = powerLevel * rackId;
  const powerString = powerLevel.toString();
  // If over 100, take hundred digit from number. Otherwise 0.
  return +(powerLevel < 100 ? 0 : powerString[powerString.length - 3]) - 5;
}

// Sum of values inside a square inside a grid
function squareSum(x, y, squareSize, grid) {
  let sum = 0;
  for (let j = y; j < y + squareSize; j++) {
    for (let i = x; i < x + squareSize; i++) {
      sum += grid[j][i];
    }
  }
  return sum;
}

// Slightly optimized version where all squares starting from (x,y) are calculated and
// largest valued will be returned.
// Larger squares use result of smaller square so that they don't need to be calculated again
function biggestSquareSum(x, y, grid, squareSize) {
  if (squareSize <= 1) {
    return [grid[y][x], grid[y][x], 1];
  }
  // last row
  let edgeSum = 0; // grid[y + squareSize - 1].reduce((sum, value) => sum + value);
  const lastRowIndex = y + squareSize - 1;
  for (let i = x; i < x + squareSize; i++) {
    edgeSum += grid[lastRowIndex][i];
  }
  // last column, not including last row
  const lastColumnIndex = x + squareSize - 1;
  for (let j = y; j < y + squareSize - 1; j++) {
    edgeSum += grid[j][lastColumnIndex];
  }
  // Get sum of smaller square
  const [subGridSum, biggestValue, biggestValueSize] = biggestSquareSum(
    x,
    y,
    grid,
    squareSize - 1
  );
  const totalSum = edgeSum + subGridSum;
  return [
    totalSum,
    Math.max(biggestValue, totalSum),
    biggestValue < totalSum ? squareSize : biggestValueSize
  ];
}
