// https://adventofcode.com/2018/day/12
import * as fs from 'fs';

const input = fs.readFileSync('inputs/day13.txt', 'utf8');
const rows = input.split('\n');
const trackMap = rows.map(row => row.split(''));

const UP = '^';
const RIGHT = '>';
const DOWN = 'v';
const LEFT = '<';

const INTERSECTION = '+';
const CURVE1 = '\\';
const CURVE2 = '/';

const trainDirections: string[] = [UP, RIGHT, DOWN, LEFT];

function part1(map: string[][]) {
  const trains = initializeTrains(map);

  while (true) {
    trains.sort((train1, train2) =>
      train1.y < train2.y || (train1.y === train2.y && train1.x < train2.x)
        ? -1
        : 1
    );
    for (let train of trains) {
      train.move(map);
      if (train.collides(trains)) {
        const { x, y } = train;
        return { x, y };
      }
    }
  }
}

function part2(map: string[][]) {
  let trains = initializeTrains(map);

  while (true) {
    let hasDisabledTrains = false;

    trains.sort((train1, train2) =>
      train1.y < train2.y || (train1.y === train2.y && train1.x < train2.x)
        ? -1
        : 1
    );

    // Using index based looping so that elements can be 'removed' during iteration
    for (let i = 0; i < trains.length; i++) {
      const train = trains[i];
      if (train && !train.disabled) {
        train.move(map);
        const collidingTrain = train.collides(trains);
        if (collidingTrain) {
          // Trains need to be marked as disabled so that others won't be able to collide into them
          train.disabled = true;
          collidingTrain.disabled = true;
          hasDisabledTrains = true;
          if (trains.length === 1) {
            break;
          }
        }
      }
    }
    if (hasDisabledTrains) {
      trains = trains.filter(train => !train.disabled);
    }

    if (trains.length === 1) {
      const train = trains[0];
      const { x, y } = train;
      return { x, y };
    }
  }
}

function initializeTrains(map: string[][]) {
  const trains: Train[] = [];
  // Note: map only cares about curves and intersections,
  // so trains don't need to be "removed" from map even when are moved elsewhere
  map.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (trainDirections.includes(cell)) {
        const train = new Train(x, y, cell);
        trains.push(train);
      }
    })
  );
  return trains;
}

class Train {
  // Determines whether to turn left (0), straight (1) or right (2)
  turnOption = 0;
  disabled = false;

  constructor(public x: number, public y: number, public dir: string) {}

  collides(trains: Train[]) {
    return trains.find(
      train =>
        train.y === this.y &&
        train.x === this.x &&
        train !== this &&
        !train.disabled
    );
  }

  move(map: string[][]) {
    this.turnIfNeeded(map);
    if (this.dir === UP) {
      this.y--;
    } else if (this.dir === RIGHT) {
      this.x++;
    } else if (this.dir === DOWN) {
      this.y++;
    } else {
      this.x--;
    }
  }

  turnIfNeeded(map: string[][]) {
    const coordinateValue = map[this.y][this.x];
    const isIntersection = coordinateValue === INTERSECTION;
    if (isIntersection) {
      if (this.turnOption === 0) {
        this.turnLeft();
      } else if (this.turnOption === 2) {
        this.turnRight();
      }
      this.turnOption = (this.turnOption + 1) % 3;
    }

    const isCurve = [CURVE1, CURVE2].includes(coordinateValue);
    if (isCurve) {
      const curveFactor = coordinateValue === CURVE1 ? 1 : -1;
      const directionFactor = this.isVertical() ? 1 : -1;
      if (curveFactor * directionFactor === 1) {
        this.turnLeft();
      } else {
        this.turnRight();
      }
    }
  }

  isVertical() {
    return this.dir === UP || this.dir === DOWN;
  }

  turnRight() {
    if (this.dir === UP) {
      this.dir = RIGHT;
    } else if (this.dir === RIGHT) {
      this.dir = DOWN;
    } else if (this.dir === DOWN) {
      this.dir = LEFT;
    } else if (this.dir === LEFT) {
      this.dir = UP;
    }
  }

  turnLeft() {
    if (this.dir === UP) {
      this.dir = LEFT;
    } else if (this.dir === RIGHT) {
      this.dir = UP;
    } else if (this.dir === DOWN) {
      this.dir = RIGHT;
    } else if (this.dir === LEFT) {
      this.dir = DOWN;
    }
  }
}

console.log('Part 1', part1(trackMap));
console.log('Part 2', part2(trackMap));
