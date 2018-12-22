// https://adventofcode.com/2018/day/18
import * as fs from 'fs';

const input = fs.readFileSync('inputs/day18.txt', 'utf8');

const acresInput = input.split('\n').map(row => row.split(''));

const OPEN = '.';
const TREE = '|';
const LUMBERYARD = '#';
const TIME = 10;
const TIME2 = 1000000000;

let acreResult = acresInput;

for (let i = 0; i < TIME; i++) {
  acreResult = updateAcres(acreResult);
}

console.log('Part 1', getResourceValue(acreResult));

// Based on manual tests, a pattern will appear eventually which repeats itself to infinity
// After a pattern is found, it's easy to determine result after any amount of iterations
acreResult = acresInput;
let previousResourceValues = [];
let pattern: number[];
let k;
for (k = 1; k <= TIME2; k++) {
  acreResult = updateAcres(acreResult);
  previousResourceValues.push(getResourceValue(acreResult));
  if (k % 1000 === 0) {
    // Don't check for patterns on every iteration, as it may take some time
    // for them to appear (first 1000th being a good candidate)
    pattern = findPattern(previousResourceValues);
    if (pattern) {
      break;
    }
  }
}
const iterationsLeft = TIME2 - k;
console.log('Part 2', pattern[(iterationsLeft - 1) % pattern.length]);

function updateAcres(acres: string[][]) {
  return acres.map((row, j) =>
    row.map((value, i) => {
      const adjacent = getAdjacentAcres(acres, i, j);
      if (value === OPEN && countSymbols(adjacent, TREE) >= 3) {
        return TREE;
      } else if (value === TREE && countSymbols(adjacent, LUMBERYARD) >= 3) {
        return LUMBERYARD;
      } else if (
        value === LUMBERYARD &&
        (countSymbols(adjacent, LUMBERYARD) === 0 ||
          countSymbols(adjacent, TREE) === 0)
      ) {
        return OPEN;
      }
      return value;
    })
  );
}

function countSymbols(array: string[], symbol: string) {
  return array.filter(char => char === symbol).length;
}

function getAdjacentAcres(acres: string[][], x: number, y: number) {
  const xStart = Math.max(0, x - 1);
  const xEnd = Math.min(acres[y].length - 1, x + 1);
  const yStart = Math.max(0, y - 1);
  const yEnd = Math.min(acres.length - 1, y + 1);
  let results = [];
  for (let j = yStart; j <= yEnd; j++) {
    for (let i = xStart; i <= xEnd; i++) {
      if (i !== x || j !== y) {
        results.push(acres[j][i]);
      }
    }
  }
  return results;
}

function getResourceValue(acres: string[][]) {
  const trees = acres.reduce((sum, row) => sum + countSymbols(row, TREE), 0);
  const lumberyards = acres.reduce(
    (sum, row) => sum + countSymbols(row, LUMBERYARD),
    0
  );
  return trees * lumberyards;
}

// Recognizes a pattern that matches min and max length requirements
// Search is started from the end, and it's enough that 1 pattern repeat is found (= start doesn't need to follow the pattern)
function findPattern(
  values: number[],
  minPatternLength = 5,
  maxPatternLength = 100
) {
  const lastValue = values[values.length - 1];
  // Find earlier instance of lastValue
  let i: number;
  for (i = values.length - 1; i >= values.length - maxPatternLength; i--) {
    if (values[i] === lastValue && values.length - i > minPatternLength) {
      break;
    }
  }
  i++;
  const patternLength = values.length - i;
  const patternValues1 = values.slice(
    values.length - patternLength,
    values.length
  );
  const patternValues2 = values.slice(
    values.length - 2 * patternLength,
    values.length - patternLength
  );
  if (patternValues1.join('') === patternValues2.join('')) {
    return patternValues1;
  }
  return undefined;
}

// For debugging
function printAcres(acres: string[][]) {
  console.log(acres.map(row => row.join('')).join('\n'));
}
