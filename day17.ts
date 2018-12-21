// https://adventofcode.com/2018/day/17
import * as fs from 'fs';
import { findMax, findMin } from './helpers';

const input = fs.readFileSync('inputs/day17.txt', 'utf8');

const coordinatesArray = input.split('\n').map(row => {
  if (row[0] === 'x') {
    const [, x, y1, y2] = row.match(/x=(\d+), y=(\d+)..(\d+)/);
    return { x: [+x], y: [+y1, +y2] };
  } else {
    const [, y, x1, x2] = row.match(/y=(\d+), x=(\d+)..(\d+)/);
    return { x: [+x1, +x2], y: [+y] };
  }
});

const maxYCoord = findMax(coordinatesArray, ({ y }) => y[1] || y[0]);
const maxY = maxYCoord.y[1] || maxYCoord.y[0];
const maxXCoord = findMax(coordinatesArray, ({ x }) => x[1] || x[0]);
const maxX = maxXCoord.x[1] || maxXCoord.x[0];

const minY = findMin(coordinatesArray, ({ y }) => y[0]).y[0];
const minX = findMin(coordinatesArray, ({ x }) => x[0]).x[0];

type Coordinates = { [key: number]: { [key: number]: string } };
const coordinates: Coordinates = {};

for (let coordinate of coordinatesArray) {
  for (
    let j = coordinate.y[0];
    j <= (coordinate.y[1] || coordinate.y[0]);
    j++
  ) {
    for (
      let i = coordinate.x[0];
      i <= (coordinate.x[1] || coordinate.x[0]);
      i++
    ) {
      if (!coordinates[j]) {
        coordinates[j] = {};
      }
      coordinates[j][i] = '#';
    }
  }
}

type WaterSource = { x: number; y: number };

const startingWaterSource = { x: 500, y: 0 };

const water1 = Array.from({ length: 14 }, (_, j) => {
  const y = j;
  return Array.from({ length: 20 }, (_, i) => {
    const x = 490 + i;
    return coordinates[y] && coordinates[y][x] ? coordinates[y][x] : '.';
  }).join('');
}).join('\n');

flowToDirection(startingWaterSource, coordinates, 0);

// Unoptimized, but good enough
const coordsStr = printCoordinates(minX - 1, maxX + 2, minY, maxY + 1);
const restingWater = coordsStr.split('').filter(char => char === '~').length;
const runningWater = coordsStr.split('').filter(char => char === '|').length;

console.log('Part 1', restingWater + runningWater);

console.log('Part 2', restingWater);

// Direction 0 means both directions (left and right)
function flowToDirection(
  waterSource: WaterSource,
  coordinates: Coordinates,
  direction: -1 | 0 | 1
): WaterSource {
  if (waterSource === undefined) {
    return;
  }
  const fallingWaterSource = flowDown(waterSource, coordinates);
  if (fallingWaterSource !== waterSource) {
    if (fallingWaterSource && fallingWaterSource.y >= maxY) {
      return fallingWaterSource;
    }
    // Start flowing from position to which have been fallen
    return flowToDirection(fallingWaterSource, coordinates, 0);
  }

  if (direction === 0) {
    // Split water to 2 directions
    flowToDirection(waterSource, coordinates, -1);
    flowToDirection(waterSource, coordinates, 1);

    const waterIsAtRest = markWaterAtRest(
      coordinates,
      waterSource.x,
      waterSource.y
    );
    if (waterIsAtRest) {
      const valueAbove = getCoordinate(
        coordinates,
        waterSource.x,
        waterSource.y - 1
      );
      if (valueAbove === undefined) {
        setCoordinate(coordinates, waterSource.x, waterSource.y - 1, '|');
      }
      return flowToDirection(
        { x: waterSource.x, y: waterSource.y - 1 },
        coordinates,
        0
      );
    }
    return waterSource;
  }

  const newWaterSource = { x: waterSource.x + direction, y: waterSource.y };
  const valueInDirection = getCoordinate(
    coordinates,
    newWaterSource.x,
    newWaterSource.y
  );

  if (valueInDirection === '#' || valueInDirection === '~') {
    // There is obstacle, or coordinate is already processed
    return waterSource;
  }
  setCoordinate(coordinates, newWaterSource.x, newWaterSource.y, '|');
  return flowToDirection(newWaterSource, coordinates, direction);
}

function flowDown(
  waterSource: WaterSource,
  coordinates: Coordinates
): WaterSource {
  const coordBelow = getCoordinate(
    coordinates,
    waterSource.x,
    waterSource.y + 1
  );
  if (coordBelow === '#' || coordBelow === '~' || waterSource.y + 1 > maxY) {
    return waterSource;
  } else {
    const newWaterSource = { x: waterSource.x, y: waterSource.y + 1 };
    if (coordBelow === '|') {
      // Already processed, no need to handle it again
      return undefined;
    } else {
      setCoordinate(coordinates, newWaterSource.x, newWaterSource.y, '|');
    }
    return flowDown(newWaterSource, coordinates);
  }
}

function setCoordinate(
  coordinates: Coordinates,
  x: number,
  y: number,
  value: string
) {
  if (!coordinates[y]) {
    coordinates[y] = {};
  }
  coordinates[y][x] = value;
}

function getCoordinate(coordinates: Coordinates, x: number, y: number) {
  return coordinates[y] && coordinates[y][x];
}

// Sets water on coordinate's row to rest if row is surrounded by walls.
// Returns true if water is set to rest, false otherwise
function markWaterAtRest(coordinates: Coordinates, x: number, y: number) {
  // Marks water coordinates on right and left side of given (x,y) to be at rest
  let iterX = x;
  let leftWall;
  let rightWall;
  while (coordinates[y][iterX] === '|') {
    iterX++;
  }
  if (coordinates[y][iterX] === '#') {
    rightWall = iterX;
  } else {
    // No wall, no water at rest
    return false;
  }
  iterX = x - 1;
  while (coordinates[y][iterX] === '|') {
    iterX--;
  }
  if (coordinates[y][iterX] === '#') {
    leftWall = iterX;
  } else {
    // No wall, no water at rest
    return false;
  }
  for (let i = leftWall + 1; i < rightWall; i++) {
    coordinates[y][i] = '~';
  }
  return true;
}

// For debugging (and also used in final result generation)
function printCoordinates(
  xStart: number,
  xEnd: number,
  yStart: number,
  yEnd: number
) {
  const str = Array.from({ length: yEnd - yStart }, (_, j) => {
    const y = yStart + j;
    return Array.from({ length: xEnd - xStart }, (_, i) => {
      const x = xStart + i;
      return coordinates[y] && coordinates[y][x] ? coordinates[y][x] : '.';
    }).join('');
  }).join('\n');
  return str;
}
