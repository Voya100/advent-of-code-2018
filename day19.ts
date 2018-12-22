// https://adventofcode.com/2018/day/19
import * as fs from 'fs';

const input = fs.readFileSync('inputs/day19.txt', 'utf8');
const lines = input.split('\n');

const ip = +lines[0].split(' ')[1];

const programCommands = lines
  .slice(1)
  .map(str => str.split(' '))
  .map(([op, a, b, c]) => [op, +a, +b, +c]);

const programRegisters = [0, 0, 0, 0, 0, 0];

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

runProgram(programRegisters, programCommands);
console.log('Part 1', programRegisters[0]);

const programRegisters2 = [1, 0, 0, 0, 0, 0];
runProgram(programRegisters2, programCommands);
console.log('Part 2', programRegisters2[0]);

function runProgram(registers: number[], commands: (string | number)[][]) {
  while (registers[ip] < commands.length) {
    const command = commands[registers[ip]];
    runCommand(registers, command);

    // Below are manual optimizations, which apply only for programs that have similar commands in same order
    // Optimizations are implemented by manually determining what program is trying to do.
    // Program tries to return sum of all values by which a generated value is divisible.
    // Original implementation tries to do this by looping all possible value pair combinations with n^2 complexity
    // and then adding iterValue1 to sum when iterValue1 * iterValue2 === value.
    // Original loop iteration is replaced with implementation where inner loop is replaced with % operator (value % iterValue1),
    // making complexity linear.
    // All puzzles seem to have same kinds of commands with slightly different register/constant values (?), so
    // these optimizations *should* work for other puzzle inputs as well (not tested)
    // (In general there doesn't really seem to be a way to optimize this without making assumptions on what the program tries to do)
    if (registers[ip] === 4) {
      const largeValue = registers[command[2] as number];
      const divValue = registers[commands[3][1] as number];
      const comparisonResultIndex = command[3] as number;
      const isDivisible = largeValue % divValue === 0;
      if (isDivisible) {
        // Replace comparison (eqrr) command result as "true"
        // This will cause next command to add divValue to sum register,
        // and after that increment divValue
        registers[comparisonResultIndex] = 1;
      } else {
        // Skip to command which increments divValue (no need to iterate the values)
        runCommand(registers, ['seti', 11, 0, ip]);
      }
    } else if (registers[ip] === 9) {
      // gtrr command
      // Stop iteration here (linear iteration gets skipped completely)
      registers[command[3] as number] = 1;
    }

    // Increase pointer value
    registers[ip]++;
  }
}

function runCommand(registers: number[], command: (string | number)[]) {
  const [op, a, b, c] = command;
  // @ts-ignore
  const operator = operators[op] as Function;
  operator(registers, a, b, c);
}
