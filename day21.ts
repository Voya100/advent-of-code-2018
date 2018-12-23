// https://adventofcode.com/2018/day/21
import * as fs from 'fs';

const input = fs.readFileSync('inputs/day21.txt', 'utf8');
const lines = input.split('\n');

const ip = +lines[0].split(' ')[1];

const programCommands = lines
  .slice(1)
  .map(str => str.split(' '))
  .map(([op, a, b, c]) => [op, +a, +b, +c]);

// From day16.ts
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

part1();
part2();

function part1() {
  const registers = [0, 0, 0, 0, 0, 0];
  // By manually looking at input, register 0 is only used for command 28,
  // which is a comparison which determines whether program closes or not.
  //
  runProgram(
    registers,
    programCommands,
    (_, nextCommand) => nextCommand[0] === 'eqrr'
  );
  const command = programCommands[28];
  console.log('Part 1', registers[(command[1] || command[2]) as number]);
}

// Warning: this is "sort of" brute force algorithm in a way that it needs to execute the program
// until the last result appears. In other words, it's not properly optimized, and its execution
// will take a moment (roughly 3 minutes)
function part2() {
  const registers = [0, 0, 0, 0, 0, 0];
  // Find last time eqrr command is used
  let commandCounter = 0;
  let latestValue = 0;
  const command = programCommands[28];
  const solutions = new Set<Number>();

  const maxCounter = 1000000;

  // Idea: loop through the program to find all possible solutions.
  // Once no more solutions are found (maxCounter limit is reached),
  // the latest new solution must be the answer.
  runProgram(registers, programCommands, (currentRegisters, nextCommand) => {
    // This gets run before every command
    if (nextCommand[0] === 'eqrr') {
      const currentSolution =
        currentRegisters[(command[1] || command[2]) as number];
      // Ignore solutions that have already been found
      // (and would thus already have ended the program)
      if (!solutions.has(currentSolution)) {
        latestValue = currentSolution;
        solutions.add(currentSolution);
        commandCounter = 0;
      }
    }
    commandCounter++;
    return commandCounter > maxCounter;
  });
  console.log('Part 2', latestValue);
}

// Partly copied from day19.ts
function runProgram(
  registers: number[],
  commands: (string | number)[][],
  stopCondition: (registers: number[], command: (string | number)[]) => boolean
) {
  while (
    registers[ip] < commands.length &&
    !stopCondition(registers, commands[registers[ip]])
  ) {
    const command = commands[registers[ip]];
    runCommand(registers, command);
    // Increase pointer value
    registers[ip]++;
  }
}

// Copied from day19.ts
function runCommand(registers: number[], command: (string | number)[]) {
  const [op, a, b, c] = command;
  // @ts-ignore
  const operator = operators[op] as Function;
  operator(registers, a, b, c);
}
