// https://adventofcode.com/2018/day/22
import * as fs from 'fs';

const input = fs.readFileSync('inputs/day22.txt', 'utf8');

const lines = input.split('\n');

const depth = +lines[0].split(': ')[1];

// How much of the map is generated past target position in x/y coordinated
// Is needed because fastest route could be located on target's right/bottom side
const TARGET_OFFSET = 100;

const WAIT_TIME = 7;

const ROCKY = 0;
const WET = 1;
const NARROW = 2;

const CLIMBING_GEAR = 0;
const TORCH = 1;
const NEITHER = 2;

type Gear = typeof CLIMBING_GEAR | typeof TORCH | typeof NEITHER;
type Regiontype = typeof ROCKY | typeof WET | typeof NARROW;

const [targetX, targetY] = lines[1]
  .split(': ')[1]
  .split(',')
  .map(str => +str);

const caveSystemErosions = Array.from({ length: targetY + TARGET_OFFSET }, () =>
  Array.from({ length: targetX + TARGET_OFFSET }, () => 0)
);

// Needs to be done with for loop, because previous row/column values need to be available
for (let j = 0; j < targetY + TARGET_OFFSET; j++) {
  for (let i = 0; i < targetX + TARGET_OFFSET; i++) {
    const geologicalIndex = getGeologicIndex(caveSystemErosions, i, j);
    const erosionLevel = getErosionLevel(geologicalIndex);
    caveSystemErosions[j][i] = erosionLevel;
  }
}
const caveSystemTypes = caveSystemErosions.map(row => row.map(getType));

part1(caveSystemTypes);
part2(caveSystemTypes);

function part1(regionTypes: Regiontype[][]) {
  const totalRiskLevel = regionTypes
    .slice(0, targetY + 1)
    .reduce(
      (sum, row) =>
        sum + row.slice(0, targetX + 1).reduce((sum2, type) => sum2 + type, 0),
      0
    );

  console.log('Part 1', totalRiskLevel);
}

function part2(regionTypes: Regiontype[][]) {
  console.log('Part 2', getQuickestRescueTime(regionTypes));
}

function getQuickestRescueTime(regionTypes: Regiontype[][]) {
  // Key: 'x,y'
  const visitedCoordinates = new Map<string, Gear[]>();

  interface Position {
    x: number;
    y: number;
    gear: Gear;
    waitTime: number;
  }

  let currentPositions: Position[] = [{ x: 0, y: 0, gear: TORCH, waitTime: 0 }];
  let time = 0;

  visitedCoordinates.set('0,0', [TORCH]);
  // BFS algorithm, which also includes different gear/waitTime states
  // Time is the measure of "distance". On each step all possible positions move to all
  // next possible positions in 1 time unit increments.
  while (true) {
    // Get possible positions after another minute has passed
    const nextPositions: Position[] = [];

    for (let position of currentPositions) {
      if (!visitedCoordinates.has(position.x + ',' + position.y)) {
        visitedCoordinates.set(position.x + ',' + position.y, [position.gear]);
      }
      if (position.waitTime) {
        position.waitTime--;
        nextPositions.push(position);
        // New actions can't be done if there is wait time => skip for now
        if (position.waitTime !== 0) {
          continue;
        }
      }

      if (
        position.x === targetX &&
        position.y === targetY &&
        position.gear === TORCH
      ) {
        // Target found and torch is equipped
        return time;
      }

      const adjacentPositions = getAdjacentRegions(
        regionTypes,
        position.x,
        position.y
      )
        .filter(({ x, y }) => {
          const visitedCoordinateGear = visitedCoordinates.get(x + ',' + y);
          return !(
            visitedCoordinateGear &&
            visitedCoordinateGear.includes(position.gear)
          );
        })
        .filter(({ type }) => canNavigate(type, position.gear))
        .map(({ x, y, type }) => ({
          x,
          y,
          type,
          gear: position.gear,
          waitTime: position.waitTime
        }));

      // Mark adjacent coordinates as visited so that they don't get
      // visited multiple times from different directions with same gear
      adjacentPositions.forEach(({ x, y, gear: adjGear }) => {
        if (!visitedCoordinates.has(x + ',' + y)) {
          visitedCoordinates.set(x + ',' + y, [adjGear]);
        } else {
          visitedCoordinates.get(x + ',' + y).push(adjGear);
        }
      });

      nextPositions.push(...adjacentPositions);

      // Equipment switch should always be done at target position
      const usedGearAtPosition = visitedCoordinates.get(
        position.x + ',' + position.y
      );
      const positionType = regionTypes[position.y][position.x];
      const gear = position.gear;
      // Go through all possible equipment switches that haven't been used
      // in that position yet
      if (
        gear !== TORCH &&
        !usedGearAtPosition.includes(TORCH) &&
        canNavigate(positionType, TORCH)
      ) {
        nextPositions.push({ ...position, gear: TORCH, waitTime: WAIT_TIME });
      }
      if (
        gear !== CLIMBING_GEAR &&
        !usedGearAtPosition.includes(CLIMBING_GEAR) &&
        canNavigate(positionType, CLIMBING_GEAR)
      ) {
        nextPositions.push({
          ...position,
          gear: CLIMBING_GEAR,
          waitTime: WAIT_TIME
        });
      }
      if (
        gear !== NEITHER &&
        !usedGearAtPosition.includes(NEITHER) &&
        canNavigate(positionType, NEITHER)
      ) {
        nextPositions.push({
          ...position,
          gear: NEITHER,
          waitTime: WAIT_TIME
        });
      }
    }
    if (nextPositions.length) {
      currentPositions = nextPositions;
    }
    time++;
  }
}

function getAdjacentRegions(regions: Regiontype[][], x: number, y: number) {
  const results = [];
  if (x > 0) {
    results.push({ x: x - 1, y, type: regions[y][x - 1] });
  }
  if (x < regions[y].length - 1) {
    results.push({ x: x + 1, y, type: regions[y][x + 1] });
  }
  if (y > 0) {
    results.push({ x, y: y - 1, type: regions[y - 1][x] });
  }
  if (y < regions.length - 1) {
    results.push({ x, y: y + 1, type: regions[y + 1][x] });
  }
  return results;
}

function canNavigate(type: number, gear: Gear) {
  if (type === ROCKY) {
    return gear === CLIMBING_GEAR || gear === TORCH;
  } else if (type === WET) {
    return gear === CLIMBING_GEAR || gear === NEITHER;
  } else if (type === NARROW) {
    return gear === TORCH || gear === NEITHER;
  }
}

function getGeologicIndex(caveErosionLevels: number[][], x: number, y: number) {
  if ((x === 0 && y === 0) || (x === targetX && y === targetY)) {
    return 0;
  } else if (x === 0) {
    return y * 48271;
  } else if (y === 0) {
    return x * 16807;
  } else {
    return caveErosionLevels[y][x - 1] * caveErosionLevels[y - 1][x];
  }
}

function getErosionLevel(geologicalIndex: number) {
  return (geologicalIndex + depth) % 20183;
}

function getType(erosionLevel: number): Regiontype {
  return (erosionLevel % 3) as Regiontype;
}

// For debugging purposes
function printCave(types: Regiontype[][]) {
  const symbols = ['.', '=', '|'];
  console.log(
    types.map(row => row.map(type => symbols[type]).join('')).join('\n')
  );
}
