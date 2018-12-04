// https://adventofcode.com/2018/day/1

const fs = require("fs");
const input = fs.readFileSync("inputs/day1.txt", "utf8");

const numbers = input.split("\n").map(str => parseInt(str, 10));
const sum = numbers.reduce((sum, num) => sum + num, 0);

console.log("Part 1", sum);

const sums = new Set();
let currentSum = 0;
let index = 0;

// Iterate until existing sum value is found
while (!sums.has(currentSum)) {
  sums.add(currentSum);
  currentSum += numbers[index % numbers.length];
  index++;
}

console.log("Part 2", currentSum);
