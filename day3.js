// https://adventofcode.com/2018/day/3

const fs = require("fs");
const input = fs.readFileSync("inputs/day3.txt", "utf8");

const claims = input.split("\n").map(stringToClaim);

function stringToClaim(str) {
  const [_, id, x, y, width, height] = str.match(
    /#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/
  );
  return {
    id,
    x: parseInt(x),
    y: parseInt(y),
    width: parseInt(width),
    height: parseInt(height)
  };
}

// Container for how many reserves are for each square inch of fabric
// fabric[y][x] = number of reservations at coordinate (x,y)
const fabric = {};

for (let claim of claims) {
  addClaim(fabric, claim);
}

function addClaim(fabric, claim) {
  const maxY = claim.y + claim.height;
  const maxX = claim.x + claim.width;
  for (let y = claim.y; y < maxY; y++) {
    if (!fabric[y]) {
      fabric[y] = {};
    }
    const row = fabric[y];
    for (let x = claim.x; x < maxX; x++) {
      row[x] = row[x] ? row[x] + 1 : 1;
    }
  }
}

const claimOverlap = Object.values(fabric)
  .map(overlapOnRow)
  .reduce((sum, overlap) => sum + overlap, 0);

function overlapOnRow(row) {
  return Object.values(row).filter(val => val > 1).length;
}
console.log("Part 1", claimOverlap);

const claimWithoutOverlap = claims.find(claim => {
  const maxY = claim.y + claim.height;
  const maxX = claim.x + claim.width;
  for (let y = claim.y; y < maxY; y++) {
    const row = fabric[y];
    for (let x = claim.x; x < maxX; x++) {
      if (row[x] > 1) {
        return false;
      }
    }
  }
  return true;
});

console.log("Part 2", claimWithoutOverlap.id);
