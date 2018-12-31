// https://adventofcode.com/2018/day/23
import * as fs from 'fs';
import { findMax, findMin } from './helpers';

const input = fs.readFileSync('inputs/day23.txt', 'utf8');

interface Coord {
  x: number;
  y: number;
  z: number;
}

interface Nanobot {
  x: number;
  y: number;
  z: number;
  r: number;
}

// Area in 3D space (cuboid shape)
interface Area {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
  zStart: number;
  zEnd: number;
}

const nanobotsInput = input
  .split('\n')
  .map(str => str.match(/pos=<([-\d]+),([-\d]+),([-\d]+)>, r=(\d+)/))
  .map(([, x, y, z, r]) => ({
    x: +x,
    y: +y,
    z: +z,
    r: +r
  }));

part1(nanobotsInput);
part2(nanobotsInput);

function part1(nanobots: Nanobot[]) {
  const strongestNanobot = findMax(nanobots, bot => bot.r);
  console.log('Part 1', nanobotsInRange(strongestNanobot, nanobots));
}

function nanobotsInRange(nanobot: Nanobot, nanobots: Nanobot[]) {
  return nanobots.filter(bot => getDistance(bot, nanobot) <= nanobot.r).length;
}

// Manhattan distance
function getDistance(coord1: Coord, coord2: Coord) {
  return (
    Math.abs(coord1.x - coord2.x) +
    Math.abs(coord1.y - coord2.y) +
    Math.abs(coord1.z - coord2.z)
  );
}

function part2(nanobots: Nanobot[]) {
  const minXNanobot = findMin(nanobots, nanobot => nanobot.x - nanobot.r);
  const maxXNanobot = findMax(nanobots, nanobot => nanobot.x + nanobot.r);
  const minYNanobot = findMin(nanobots, nanobot => nanobot.y - nanobot.r);
  const maxYNanobot = findMax(nanobots, nanobot => nanobot.y + nanobot.r);
  const minZNanobot = findMin(nanobots, nanobot => nanobot.z - nanobot.r);
  const maxZNanobot = findMax(nanobots, nanobot => nanobot.z + nanobot.r);

  const area: Area = {
    xStart: minXNanobot.x - minXNanobot.r,
    xEnd: maxXNanobot.x + minXNanobot.r,
    yStart: minYNanobot.y - minXNanobot.r,
    yEnd: maxYNanobot.y + minXNanobot.r,
    zStart: minZNanobot.z - minXNanobot.r,
    zEnd: maxZNanobot.z + minXNanobot.r
  };

  const [coordinate] = findCoordinateWithMostNanobots(area, nanobots);
  console.log(
    'Part 2',
    getDistance(
      { x: coordinate.xStart, y: coordinate.yStart, z: coordinate.zStart },
      { x: 0, y: 0, z: 0 }
    )
  );
}

// Recursively divides space into octree (8 equal sized cubes) and figures out with how many nanobots
// it intersects with. Biggest intersection cube of 1x1 size will get returned.
function findCoordinateWithMostNanobots(
  currentArea: Area,
  nanobots: Nanobot[],
  bestArea: Area = undefined,
  bestIntersectionCount = 0
): [Area, number] {
  if (
    currentArea.xEnd === currentArea.xStart &&
    currentArea.yEnd === currentArea.yStart &&
    currentArea.zEnd === currentArea.zStart
  ) {
    // Area is a single coordinate
    return [
      currentArea,
      nanobotIntersectionsWithArea(currentArea, nanobots).length
    ];
  }
  // If this area can't contain any better results => skip
  if (
    bestIntersectionCount > nanobots.length ||
    (bestIntersectionCount === nanobots.length &&
      isCloserToOrigin(bestArea, currentArea))
  ) {
    return [bestArea, bestIntersectionCount];
  }

  // Split 3D space into 8 (2x2x2) areas, and determine recursively coordinate with highest
  // number of intersections
  const subareas = divideArea(currentArea);
  const subareasWithIntersections: [Area, Nanobot[]][] = subareas.map(
    area =>
      [area, nanobotIntersectionsWithArea(area, nanobots)] as [Area, Nanobot[]]
  );
  // Sort by number of intersections, and then by closeness to origin
  // This way most likely areas to contain desired result is handled first
  subareasWithIntersections.sort(([, intersections1], [, intersections2]) => {
    if (intersections1.length < intersections2.length) {
      return 1;
    } else if (
      intersections1.length === intersections2.length &&
      (!bestArea || isCloserToOrigin(currentArea, bestArea))
    ) {
      return 1;
    }
    return -1;
  });

  for (let [area, intersections] of subareasWithIntersections) {
    if (intersections.length < bestIntersectionCount) {
      // Optimisation
      continue;
    }
    const [childArea, childCount] = findCoordinateWithMostNanobots(
      area,
      intersections,
      bestArea,
      bestIntersectionCount
    );
    if (childCount >= bestIntersectionCount) {
      if (
        childCount > bestIntersectionCount ||
        !bestArea ||
        isCloserToOrigin(childArea, bestArea)
      ) {
        bestArea = childArea;
        bestIntersectionCount = childCount;
        if (childCount === nanobots.length) {
          return [bestArea, bestIntersectionCount];
        }
      }
    }
  }
  return [bestArea, bestIntersectionCount];
}

// Divides area into 8 smaller areas in 3D space
function divideArea(area: Area) {
  const areas = [];
  for (let i = 0; i < 2; i++) {
    if (i === 1 && area.xEnd === area.xStart) {
      continue;
    }
    for (let j = 0; j < 2; j++) {
      if (j === 1 && area.yEnd === area.yStart) {
        continue;
      }
      for (let k = 0; k < 2; k++) {
        if (k === 1 && area.zEnd === area.zStart) {
          continue;
        }
        areas.push({
          xStart:
            area.xStart + Math.floor((i * (area.xEnd - area.xStart + 1)) / 2),
          xEnd:
            area.xStart + Math.floor(((i + 1) * (area.xEnd - area.xStart)) / 2),
          yStart:
            area.yStart + Math.floor((j * (area.yEnd - area.yStart + 1)) / 2),
          yEnd:
            area.yStart + Math.floor(((j + 1) * (area.yEnd - area.yStart)) / 2),
          zStart:
            area.zStart + Math.floor((k * (area.zEnd - area.zStart + 1)) / 2),
          zEnd:
            area.zStart + Math.floor(((k + 1) * (area.zEnd - area.zStart)) / 2)
        });
      }
    }
  }
  return areas;
}

function isCloserToOrigin(area1: Area, area2: Area) {
  const distance1 =
    Math.min(Math.abs(area1.xStart), Math.abs(area1.xEnd)) +
    Math.min(Math.abs(area1.yStart), Math.abs(area1.yEnd)) +
    Math.min(Math.abs(area1.yStart), Math.abs(area1.yEnd));
  const distance2 =
    Math.min(Math.abs(area2.xStart), Math.abs(area2.xEnd)) +
    Math.min(Math.abs(area2.yStart), Math.abs(area2.yEnd)) +
    Math.min(Math.abs(area2.yStart), Math.abs(area2.yEnd));
  return distance1 < distance2;
}

function nanobotIntersectionsWithArea(area: Area, nanobots: Nanobot[]) {
  return nanobots.filter(nanobot => nanobotsIntersectsWithArea(area, nanobot));
}

function nanobotsIntersectsWithArea(area: Area, nanobot: Nanobot) {
  // x/y/z values in area closest to nanobot location
  let closestX;
  let closestY;
  let closestZ;
  if (area.xStart <= nanobot.x && nanobot.x <= area.xEnd) {
    closestX = nanobot.x;
  } else if (
    Math.abs(area.xStart - nanobot.x) <= Math.abs(area.xEnd - nanobot.x)
  ) {
    closestX = area.xStart;
  } else {
    closestX = area.xEnd;
  }
  if (area.yStart <= nanobot.y && nanobot.y <= area.yEnd) {
    closestY = nanobot.y;
  } else if (
    Math.abs(area.yStart - nanobot.y) <= Math.abs(area.yEnd - nanobot.y)
  ) {
    closestY = area.yStart;
  } else {
    closestY = area.yEnd;
  }
  if (area.zStart <= nanobot.z && nanobot.z <= area.zEnd) {
    closestZ = nanobot.z;
  } else if (
    Math.abs(area.zStart - nanobot.z) <= Math.abs(area.zEnd - nanobot.z)
  ) {
    closestZ = area.zStart;
  } else {
    closestZ = area.zEnd;
  }
  if (
    getDistance({ x: closestX, y: closestY, z: closestZ }, nanobot) > nanobot.r
  ) {
    return false;
  }
  return true;
}
