// https://adventofcode.com/2018/day/12

const fs = require("fs");

const input = fs.readFileSync("inputs/day12.txt", "utf8").split("\n\n");

const initialState = input[0].split(" ")[2];

const rulesArray = input[1].split("\n").map(str => str.split(" => "));
const rules = new Map(rulesArray);

const GENERATIONS = 20;
const GENERATIONS_2 = 50000000000;

const RULE_LENGTH = 5;
const RULE_MIDDLE_INDEX = 2;

let state = initialState;
let leftOffset = 0;
for (let i = 0; i < GENERATIONS; i++) {
  [state, leftOffset] = runGeneration(state, leftOffset);
}

console.log("Part 1", plantSum(state, leftOffset));

// Theory found by experimenting: at some point, when program has been going for long enough,
// each iteration will add same amount of plants.

state = initialState;
leftOffset = 0;
let prevSum;
let prevSumDifference = 0;
let sumDifferenceCount = 0;
let i;
for (i = 0; i < GENERATIONS_2; i++) {
  [state, leftOffset] = runGeneration(state, leftOffset);
  const sum = plantSum(state, leftOffset);
  if (prevSumDifference === sum - prevSum) {
    sumDifferenceCount++;
  }
  // Reasonable amount must be same to make sure it's a constant pattern
  if (sumDifferenceCount > 100) {
    break;
  }
  prevSumDifference = sum - prevSum;
  prevSum = sum;
}
console.log(
  "Part 2",
  plantSum(state, leftOffset) + (GENERATIONS_2 - i - 1) * prevSumDifference
);

/**
 * @param {string} state
 * @param {number} leftOffset
 */
function runGeneration(state, leftOffset = 0) {
  [state, leftOffset] = addStartAndEndBuffer(state, leftOffset);
  const endIndex = state.length - RULE_MIDDLE_INDEX - 1;
  let newState = state.substr(0, RULE_MIDDLE_INDEX);
  for (let i = RULE_MIDDLE_INDEX; i < endIndex; i++) {
    const ruleStr = state.substr(i - RULE_MIDDLE_INDEX, RULE_LENGTH);
    newState += rules.get(ruleStr) || ".";
  }
  newState += state.substr(
    state.length - RULE_MIDDLE_INDEX - 1,
    RULE_MIDDLE_INDEX
  );
  return [newState, leftOffset];
}

/**
 * Adds enough dots to start and end so that edge cases can also be handled
 * @param {string} state
 * @param {number} leftOffset
 */
function addStartAndEndBuffer(state, leftOffset) {
  const sameCharsOnLeft = getNumberOfAdjacentCharacters(
    state,
    0,
    RULE_LENGTH + 2,
    ".",
    1
  );
  const sameCharsOnRight = getNumberOfAdjacentCharacters(
    state,
    state.length - 1,
    RULE_LENGTH + 2,
    ".",
    -1
  );
  const str =
    ".".repeat(RULE_LENGTH + 2 - sameCharsOnLeft) +
    state +
    ".".repeat(RULE_LENGTH + 2 - sameCharsOnRight);
  return [str, leftOffset - (RULE_LENGTH + 2 - sameCharsOnLeft)];
}

function getNumberOfAdjacentCharacters(
  str,
  startIndex,
  amount,
  character,
  direction = 1
) {
  let sameChars = 0;
  const endIndex = startIndex + amount * direction;
  // Note: Small risk of infinite loop if used incorrectly
  // Is however easiest way to get it work for both directions
  for (let i = startIndex; i !== endIndex; i += direction) {
    if (str[i] === character) {
      sameChars++;
    } else {
      break;
    }
  }
  return sameChars;
}

function plantSum(state, leftOffset) {
  let sum = 0;
  for (let i = 0; i < state.length; i++) {
    if (state[i] === "#") {
      sum += i + leftOffset;
    }
  }
  return sum;
}
