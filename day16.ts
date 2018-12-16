// https://adventofcode.com/2018/day/16
import * as fs from 'fs';

const input = fs.readFileSync('inputs/day16.txt', 'utf8');

const [input1, input2] = input.split('\n\n\n\n');

const samples = input1
  .split('\n\n')
  .map(str => str.split('\n'))
  .map(([line1, line2, line3]) => {
    const before = line1
      .match(/\[([ \d,]+)\]/)[1]
      .split(', ')
      .map(str => +str);
    const command = line2.split(' ').map(str => +str);
    const after = line3
      .match(/\[([ \d,]+)\]/)[1]
      .split(', ')
      .map(str => +str);
    return { before, command, after };
  });

const operators = {
  addr: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = registers[a] + registers[b]),
  addi: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = registers[a] + b),
  mulr: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = registers[a] * registers[b]),
  muli: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = registers[a] * b),
  banr: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = registers[a] & registers[b]),
  bani: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = registers[a] & b),
  borr: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = registers[a] | registers[b]),
  bori: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = registers[a] | b),
  setr: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = registers[a]),
  seti: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = a),
  gtir: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = registers[b] < a ? 1 : 0),
  gtri: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = registers[a] > b ? 1 : 0),
  gtrr: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = registers[a] > registers[b] ? 1 : 0),
  eqir: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = registers[b] === a ? 1 : 0),
  eqri: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = registers[a] === b ? 1 : 0),
  eqrr: (registers: number[], a: number, b: number, c: number) =>
    (registers[c] = registers[a] === registers[b] ? 1 : 0)
};

const operatorEnties = Object.entries(operators);

const possibleOpCodeMatches: Set<
  (registers: number[], a: number, b: number, c: number) => number
>[] = Array.from({ length: 16 });

let numberWithMoreThan3OpSamples = 0;

for (let sample of samples) {
  const { before, after, command } = sample;
  const [opCode, a, b, c] = command;
  const operatorMatches = operatorEnties.filter(([opName, operator]) => {
    const beforeCopy = [...before];
    operator(beforeCopy, a, b, c);
    return beforeCopy.toString() === after.toString();
  });

  const operatorFunctions = operatorMatches.map(
    ([opName, opFunction]) => opFunction
  );

  if (operatorMatches.length >= 3) {
    numberWithMoreThan3OpSamples++;
  }

  if (!possibleOpCodeMatches[opCode]) {
    possibleOpCodeMatches[opCode] = new Set(operatorFunctions);
  } else if (possibleOpCodeMatches[opCode].size > 1) {
    const previousMatches = possibleOpCodeMatches[opCode];
    possibleOpCodeMatches[opCode] = new Set(
      operatorFunctions.filter(str => previousMatches.has(str))
    );
  }
}

// Assumption: correct operators can be determined by very simple process of elimination
// in which on each loop round at least 1 of the rules has only 1 remaining option
// which can be removed from others
const foundOperators = new Set();
while (foundOperators.size < 16) {
  // Very unoptimized loop, but good enough for a sample size this small
  for (let operatorMatches of possibleOpCodeMatches) {
    if (operatorMatches.size === 1) {
      const opFunc = operatorMatches.values().next().value;
      if (!foundOperators.has(opFunc)) {
        foundOperators.add(opFunc);
      }
    } else {
      foundOperators.forEach(op => operatorMatches.delete(op));
    }
  }
}

// After filtering each code should have only 1 match
const opCodeOperators = possibleOpCodeMatches.map(
  set => set.values().next().value
);
const programRegisters = [0, 0, 0, 0];

const programRows = input2
  .split('\n')
  .map(row => row.split(' ').map(str => +str));

// Run the program
for (let [opCode, a, b, c] of programRows) {
  const opFunction = opCodeOperators[opCode];
  opFunction(programRegisters, a, b, c);
}

console.log('Part 1', numberWithMoreThan3OpSamples);
console.log('Part 2', programRegisters[0]);
