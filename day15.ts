// https://adventofcode.com/2018/day/15
import * as fs from 'fs';

const input = fs.readFileSync('inputs/day15.txt', 'utf8');

const MAX_HEALTH = 200;

function part1() {
  const battle = new Battle(input);
  battle.startGame();
  const rounds = battle.round;
  const hitPointSum = battle.units.reduce(
    (sum, unit) => sum + unit.hitPoints,
    0
  );
  return { rounds, hitPointSum, solution: rounds * hitPointSum };
}

function part2() {
  // Binary search can't be used, because "winning" with some attackPower
  // doesn't automatically mean that all higher ones also win
  let attackPower;
  let battle: Battle;
  for (attackPower = 3; attackPower <= MAX_HEALTH; attackPower++) {
    battle = new Battle(input, attackPower);
    const numberOfElves = battle.elves.length;
    battle.startGame();
    if (battle.elves.length === numberOfElves) {
      // Everyone survived
      break;
    }
  }
  const rounds = battle.round;
  const hitPointSum = battle.units.reduce(
    (sum, unit) => sum + unit.hitPoints,
    0
  );
  return { rounds, hitPointSum, solution: rounds * hitPointSum };
}

class Battle {
  squares: Square[][];
  // Wall squares are not used much, so filtered
  // and more easily iterable version is kept separately
  nonWallSquares: Square[] = [];
  units: Unit[] = [];
  elves: Unit[] = [];
  goblins: Unit[] = [];
  round = 0;

  constructor(
    mapInput: string,
    private elfAttackPower = 3,
    private goblinAttackPower = 3
  ) {
    this.initializeMapAndUnits(mapInput);
  }

  initializeMapAndUnits(mapInput: string) {
    const mapRows = mapInput.split('\n');
    this.squares = mapRows.map((row, y) => {
      return row
        .split('')
        .map((cell, x) => this.initializeSquaraAndUnit(x, y, cell));
    });
    this.units = [...this.elves, ...this.goblins];
    this.nonWallSquares.forEach(square => (square.squares = this.squares));
  }

  initializeSquaraAndUnit(x: number, y: number, cellValue: string): Square {
    const square = new Square(x, y, cellValue);
    if (cellValue === 'E' || cellValue === 'G') {
      this.initializeUnit(square, cellValue);
    }
    if (!square.isWall) {
      this.nonWallSquares.push(square);
    }
    return square;
  }

  initializeUnit(square: Square, typeName: string) {
    const isElf = typeName === 'E';
    const unit = new Unit(
      isElf,
      square,
      isElf ? this.elfAttackPower : this.goblinAttackPower
    );
    if (isElf) {
      this.elves.push(unit);
    } else {
      this.goblins.push(unit);
    }
    square.unit = unit;
    return unit;
  }

  startGame() {
    while (this.elves.length && this.goblins.length) {
      this.runRound();
      // Debug print for seeing game progress
      // this.printBattleState();
    }
  }

  runRound() {
    // Sorts units by their (x,y) position (top-to-bottom, left-to-right)
    this.units.sort((unit1, unit2) =>
      unit1.y < unit2.y || (unit1.y === unit2.y && unit1.x < unit2.x) ? -1 : 1
    );

    let elvesKilled = 0;
    let goblinsKilled = 0;

    for (let unit of this.units) {
      if (unit.isDead) {
        continue;
      }
      if (
        goblinsKilled === this.goblins.length ||
        elvesKilled === this.elves.length
      ) {
        // One side eliminated, battle ends
        this.filterDeadUnits();
        return;
      }
      const actionInfo = this.makeTurn(unit);
      if (actionInfo.enemyKilled) {
        if (unit.isElf) {
          goblinsKilled++;
        } else {
          elvesKilled++;
        }
      }
    }
    this.filterDeadUnits();
    this.round++;
  }

  makeTurn(unit: Unit) {
    const actionInfo = unit.makeTurn();
    this.resetSquareNodeStates();
    return actionInfo;
  }

  resetSquareNodeStates() {
    // Units mark squares as seen during their turns
    // This will reset them all to unseen state
    this.nonWallSquares.forEach(square => square.resetNodeState());
  }

  filterDeadUnits() {
    this.elves = this.elves.filter(elf => !elf.isDead);
    this.goblins = this.goblins.filter(goblin => !goblin.isDead);
    this.units = [...this.elves, ...this.goblins];
  }

  // Used for debugging purposes
  printBattleState() {
    const battleStr = this.squares
      .map(row =>
        row
          .map(cell => {
            if (cell.isWall) {
              return '#';
            } else if (cell.unit) {
              return cell.unit.isElf ? 'E' : 'G';
            }
            return '.';
          })
          .join('')
      )
      .join('\n');
    console.log('Round: ', this.round);
    console.log('Map:');
    console.log(battleStr);
    console.log('Elves:', this.elves.map(elf => elf.info));
    console.log('Goblins:', this.goblins.map(goblin => goblin.info));
  }
}

class Unit {
  hitPoints = MAX_HEALTH;

  constructor(
    public isElf: boolean,
    public square: Square,
    public attackPower = 3
  ) {}

  get adjacentSquares() {
    return this.square.adjacentSquares;
  }

  get isDead() {
    return this.hitPoints <= 0;
  }

  get x() {
    return this.square.x;
  }
  get y() {
    return this.square.y;
  }

  // For debugging purposes
  get info() {
    const { x, y, hitPoints } = this;
    return { x, y, hitPoints };
  }

  makeTurn() {
    const moveTarget = this.selectMoveTarget();
    this.move(moveTarget);

    const enemySquares = this.adjacentSquares.filter(square =>
      square.containsEnemy(this)
    );
    if (enemySquares.length) {
      // Sort first by hitpoints, the by (x,y) position
      enemySquares.sort((square1, square2) =>
        square1.unit.hitPoints < square2.unit.hitPoints ||
        (square1.unit.hitPoints === square2.unit.hitPoints &&
          (square1.y < square2.y ||
            (square1.y === square2.y && square1.x < square2.x)))
          ? -1
          : 1
      );
      const enemy = enemySquares[0].unit;
      const enemyKilled = this.attack(enemy);
      return { enemyKilled };
    }
    return { enemyKilled: false };
  }

  attack(enemy: Unit) {
    enemy.hitPoints -= this.attackPower;
    if (enemy.isDead) {
      // Remove enemy from board
      enemy.square.unit = undefined;
      return true;
    }
    return false;
  }

  move(square: Square) {
    if (square !== this.square) {
      this.square.unit = undefined;
      this.square = square;
      square.unit = this;
    }
  }

  selectMoveTarget() {
    let squares = this.adjacentSquares.filter(
      sq => !sq.unit || sq.containsEnemy(this)
    );
    let targetSquares: Square[] = [];
    this.square.nodeState.checked = true;

    // Basic BFS algorithm
    while (!targetSquares.length && squares.length) {
      const nextSquares: Square[] = [];
      for (let square of squares) {
        if (square.nodeState.checked) {
          continue;
        }
        if (square.containsEnemy(this)) {
          // If previous square is not defined, it must be square next to unit's square
          targetSquares.push(square.nodeState.previousSquare || this.square);
        } else {
          // Squares that are not visited and don't contain a friendly unit
          const adjacentSquares = square.adjacentSquares.filter(
            sq =>
              sq.nodeState.checked === false &&
              sq.nodeState.previousSquare === undefined &&
              (!sq.unit || sq.containsEnemy(this))
          );
          // Add current square as previous square for squares next to it
          adjacentSquares.forEach(
            adjacentSquare => (adjacentSquare.nodeState.previousSquare = square)
          );
          nextSquares.push(...adjacentSquares);
        }
        square.nodeState.checked = true;
      }
      squares = nextSquares;
    }
    targetSquares.sort((square1, square2) =>
      square1.y < square2.y ||
      (square1.y === square2.y && square1.x < square2.x)
        ? -1
        : 1
    );
    return targetSquares[0] ? targetSquares[0].startNode : this.square;
  }
}

class Square {
  isWall: boolean;
  unit: Unit;
  squares: Square[][];

  // Used for graph algorithm (BFS)
  nodeState = {
    checked: false,
    previousSquare: undefined as Square
  };

  // For debugging purposes
  get info(): any {
    const { x, y, nodeState } = this;
    return {
      x,
      y,
      nodeState: {
        checked: nodeState.checked,
        previousSquare: nodeState.previousSquare && {
          x: nodeState.previousSquare.x,
          y: nodeState.previousSquare.y
        }
      },
      unit: this.unit && this.unit.isElf
    };
  }

  constructor(public x: number, public y: number, value: string) {
    this.isWall = value === '#';
  }

  get isObstacle() {
    return this.isWall || this.unit !== undefined;
  }

  // Relevant adjacent squares that aren't walls
  get adjacentSquares() {
    return [this.up, this.left, this.right, this.down].filter(
      square => square !== undefined && !square.isWall
    );
  }

  // Square on left side, etc.
  get left(): Square {
    return this.x === 0 ? undefined : this.squares[this.y][this.x - 1];
  }
  get right(): Square {
    return this.x === this.squares[0].length - 1
      ? undefined
      : this.squares[this.y][this.x + 1];
  }
  get up(): Square {
    return this.y === 0 ? undefined : this.squares[this.y - 1][this.x];
  }
  get down(): Square {
    return this.y === this.squares.length - 1
      ? undefined
      : this.squares[this.y + 1][this.x];
  }

  get startNode(): Square {
    return (
      (this.nodeState.previousSquare &&
        this.nodeState.previousSquare.startNode) ||
      this
    );
  }

  containsEnemy(unit: Unit) {
    return this.unit && this.unit.isElf !== unit.isElf;
  }

  resetNodeState() {
    this.nodeState = {
      checked: false,
      previousSquare: undefined
    };
  }
}

console.log('Part 1', part1());
console.log('Part 2', part2());
