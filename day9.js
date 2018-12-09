// @ts-check
// https://adventofcode.com/2018/day/9

const fs = require("fs");

const input = fs.readFileSync("inputs/day9.txt", "utf8");

const [, numberOfPlayers, lastMarblePoints] = input
  .match(/(\d+) players; last marble is worth (\d+) points/)
  .map(str => +str);

class Game {
  constructor(numberOfPlayers) {
    this.playerScores = Array.from({ length: numberOfPlayers }).map(() => 0);
    this.numberOfPlayers = numberOfPlayers;

    // Needs to be implemented as a linked list instead of array for performance reasons.
    // TODO: Maybe more generic List class?
    this.marbleList = {
      value: 0
    };
    this.marbleList.left = this.marbleList;
    this.marbleList.right = this.marbleList;
    this.activeMarbleIndex = 0;
    this.activePlayerIndex = 0;
    this.turn = 1;
  }

  addMarble(offset, value) {
    let marble = this.getMarble(offset);
    const newMarble = {
      value,
      left: marble.left,
      right: marble
    };
    marble.left.right = newMarble;
    marble.left = newMarble;
    return newMarble;
  }

  // Returns marble right to the removed marble
  removeMarble(marble) {
    marble.left.right = marble.right;
    marble.right.left = marble.left;
    return marble.right;
  }

  getMarble(offset) {
    let marble = this.marbleList;
    if (offset < 0) {
      while (offset < 0) {
        marble = marble.left;
        offset++;
      }
    } else {
      while (offset > 0) {
        marble = marble.right;
        offset--;
      }
    }
    return marble;
  }

  addToActivePlayerScore(score) {
    this.playerScores[this.activePlayerIndex] += score;
  }

  nextPlayer() {
    return (this.activePlayerIndex =
      (this.activePlayerIndex + 1) % this.numberOfPlayers);
  }

  get activeMarbleValue() {
    return this.marbleList.value;
  }

  playTurn() {
    if (this.turn % 23 === 0) {
      const marbleToRemove = this.getMarble(-7);
      this.marbleList = this.removeMarble(marbleToRemove);
      this.addToActivePlayerScore(marbleToRemove.value + this.turn);
      this.turn++;
      this.nextPlayer();
      return;
    }
    this.marbleList = this.addMarble(2, this.turn++);
    this.nextPlayer();
  }

  getWinnerScore() {
    return Math.max(...this.playerScores);
  }
}

const game = new Game(numberOfPlayers);
while (game.turn <= lastMarblePoints) {
  game.playTurn();
}

console.log("Part 1", game.getWinnerScore());

// Same game object can be used
while (game.turn <= lastMarblePoints * 100) {
  game.playTurn();
}

console.log("Part 2", game.getWinnerScore());
