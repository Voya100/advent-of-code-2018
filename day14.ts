// https://adventofcode.com/2018/day/14
import * as fs from 'fs';

const input = fs.readFileSync('inputs/day14.txt', 'utf8');

const RECIPES_AFTER = 10;

console.log('Part 1', part1(+input));
console.log('Part 2', part2(input));

function part1(rounds: number) {
  let recipes = [3, 7];
  const elfIndices: [number, number] = [0, 1];
  while (recipes.length < rounds + RECIPES_AFTER) {
    addRecipe(recipes, elfIndices);
  }
  return recipes.slice(recipes.length - RECIPES_AFTER).join('');
}

function part2(scoreMatch: string) {
  let recipes = [3, 7];
  const elfIndices: [number, number] = [0, 1];
  while (!recipeFound(scoreMatch.length + 1)) {
    addRecipe(recipes, elfIndices);
  }
  // If 2 recipes are added and second one is not included in match,
  // offset of 1 must be taken to account
  const offset = recipeFound(scoreMatch.length) ? 0 : -1;
  return recipes.length - scoreMatch.length + offset;

  function recipeFound(offsetFromEnd: number) {
    return recipes
      .slice(recipes.length - offsetFromEnd)
      .join('')
      .includes(scoreMatch);
  }
}

function addRecipe(recipes: number[], elves: [number, number]) {
  const score1 = recipes[elves[0]];
  const score2 = recipes[elves[1]];
  const scoreSumStr = (score1 + score2).toString();
  recipes.push(...scoreSumStr.split('').map(char => +char));
  elves[0] = (elves[0] + score1 + 1) % recipes.length;
  elves[1] = (elves[1] + score2 + 1) % recipes.length;
  return scoreSumStr;
}
