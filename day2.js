// https://adventofcode.com/2018/day/2

const fs = require("fs");
const input = fs.readFileSync("inputs/day2.txt", "utf8");

const ids = input.split("\n");

let twos = 0;
let threes = 0;

ids.forEach(id => {
  let str = id.split("");
  // Find counts for all characters in string
  const counts = str.reduce((result, char) => {
    result[char] = result[char] === undefined ? 1 : result[char] + 1;
    return result;
  }, {});

  const has2 = Object.values(counts).some(res => res === 2);
  const has3 = Object.values(counts).some(res => res === 3);
  if (has2) {
    twos++;
  }
  if (has3) {
    threes++;
  }
});
console.log("Part 1", twos * threes);

function findSimilar(ids) {
  // Note: Not optimal from performance point of view, because each combination can get handled twice (n^2)
  // Is however easier to read than index based looping, and input is not too large,
  // so is good enough for this purpose
  for (let id1 of ids) {
    for (let id2 of ids) {
      if (isSimilar(id1, id2)) {
        return sharedChars(id1, id2);
      }
    }
  }
}

// Exactly 1 character is different
function isSimilar(str1, str2) {
  return str1.length - sharedChars(str1, str2).length === 1;
}

function sharedChars(str1, str2) {
  return str1
    .split("")
    .filter((char, i) => char === str2[i])
    .join("");
}

let result = findSimilar(ids);
console.log("Part 2", result);
