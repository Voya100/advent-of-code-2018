// https://adventofcode.com/2018/day/25
import * as fs from 'fs';

const input = fs.readFileSync('inputs/day25.txt', 'utf8');

const CONSTELLATION_DISTANCE = 3;

interface Point {
  coordinate: number[];
  constellation: Point[];
}

const pointsInput: Point[] = input.split('\n').map(str => ({
  coordinate: str.split(',').map(numStr => +numStr),
  constellation: []
}));

part1(pointsInput);

function part1(points: Point[]) {
  setConstellations(points);
  // Get each unique constellation
  const constellations = new Set(points.map(point => point.constellation));
  console.log('Part 1', constellations.size);
}

function setConstellations(points: Point[]) {
  points.forEach(point => point.constellation.push(point));

  for (let i = 0; i < points.length; i++) {
    const point = points[i];

    const closePoints = points
      .slice(i)
      .filter(
        point2 =>
          getDistance(point.coordinate, point2.coordinate) <=
          CONSTELLATION_DISTANCE
      );
    if (closePoints.length <= 1) {
      // No new close points found
      continue;
    }

    // Combine constellations of all close points
    const constellation = [
      ...new Set(
        closePoints.reduce(
          (result, point2) => (result.push(...point2.constellation), result),
          []
        )
      )
    ];
    // Assign new constellation for all close points
    constellation.forEach(point2 => (point2.constellation = constellation));
  }
}

function getDistance(coordinate1: number[], coordinate2: number[]) {
  return coordinate1.reduce(
    (sum, value, index) => sum + Math.abs(coordinate2[index] - value),
    0
  );
}
