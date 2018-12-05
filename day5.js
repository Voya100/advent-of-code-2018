// https://adventofcode.com/2018/day/5

const fs = require("fs");
const input = fs.readFileSync("inputs/day5.txt", "utf8");

const collapsedCharacters = collapseReactions(input);

console.log("part 1", collapsedCharacters.length);

// Note: Could be more performant to have a fixed list of whole alphabet, but this is slightly more flexible
const uniqueCharacters = new Set(collapsedCharacters);
const uniqueLowercaseCharacters = [...uniqueCharacters].filter(
  char => char === char.toLowerCase()
);

let shortestPolymerLength = collapsedCharacters.length;

// Iterate all unique characters, filter each and find shortest result
for (let char of uniqueLowercaseCharacters) {
  const uppercase = char.toUpperCase();
  const filteredInput = collapsedCharacters.filter(
    filterableChar => filterableChar !== char && filterableChar !== uppercase
  );
  const polymerLength = collapseReactions(filteredInput).length;
  if (polymerLength < shortestPolymerLength) {
    shortestPolymerLength = polymerLength;
  }
}

console.log("part 2", shortestPolymerLength);

function collapseReactions(characters) {
  const result = [];
  let previousChar;

  for (let char of characters) {
    if (previousChar && unitsReact(char, previousChar)) {
      result.pop();
      previousChar = result[result.length - 1];
    } else {
      result.push(char);
      previousChar = char;
    }
  }
  return result;
}

function unitsReact(unit1, unit2) {
  return unit1.toLowerCase() === unit2.toLowerCase() && unit1 !== unit2;
}
