// https://adventofcode.com/2018/day/24
import * as fs from 'fs';

const input = fs.readFileSync('inputs/day24.txt', 'utf8');

class Battle {
  // Sort function for .sort
  static targetSelectionOrder(unit1: ArmyUnit, unit2: ArmyUnit) {
    if (unit1.effectivePower < unit2.effectivePower) {
      return 1;
    } else if (unit1.effectivePower === unit2.effectivePower) {
      return unit1.initiative < unit2.initiative ? 1 : -1;
    }
    return -1;
  }

  static attackingOrder(unit1: ArmyUnit, unit2: ArmyUnit) {
    return unit1.initiative < unit2.initiative ? 1 : -1;
  }

  constructor(
    public immuneArmy: ArmyUnit[],
    public infectionArmy: ArmyUnit[],
    immuneBoost = 0
  ) {
    infectionArmy.forEach(unit => (unit.isImmuneSystem = false));
    immuneArmy.forEach(unit => (unit.damageValue += immuneBoost));
  }

  playBattle() {
    while (this.immuneArmy.length && this.infectionArmy.length) {
      const immuneArmyUnitsBefore = this.getTotalUnits(this.immuneArmy);
      const infectionArmyUnitsBefore = this.getTotalUnits(this.infectionArmy);
      this.playRound();

      const immuneArmyUnitsAfter = this.getTotalUnits(this.immuneArmy);
      const infectionArmyUnitsAfter = this.getTotalUnits(this.infectionArmy);

      if (
        immuneArmyUnitsBefore === immuneArmyUnitsAfter &&
        infectionArmyUnitsBefore === infectionArmyUnitsAfter
      ) {
        // No units have been killed => Stalemate, units can't kill each other
        // Battle will be stopped because it would never end.
        break;
      }
    }
  }

  playRound() {
    const units = [...this.immuneArmy, ...this.infectionArmy];
    units.sort(Battle.targetSelectionOrder);

    // Reset units' target and targetedBy attributes
    units.forEach(unit => unit.reset());

    // Target selection phase
    for (let unit of units) {
      const enemies = unit.isImmuneSystem
        ? this.infectionArmy
        : this.immuneArmy;
      unit.selectTarget(enemies);
    }

    // Attacking phase
    units.sort(Battle.attackingOrder);
    for (let unit of units) {
      unit.attack();
    }
    this.immuneArmy = this.immuneArmy.filter(unit => unit.numberOfUnits > 0);
    this.infectionArmy = this.infectionArmy.filter(
      unit => unit.numberOfUnits > 0
    );
  }

  getTotalUnits(army: ArmyUnit[]) {
    return army.reduce((sum, unit) => sum + unit.numberOfUnits, 0);
  }
}

class ArmyUnit {
  public isImmuneSystem = true;
  public target: ArmyUnit;
  public targetedBy: ArmyUnit;

  constructor(
    public numberOfUnits: number,
    public hitPoints: number,
    public damageValue: number,
    public damageType: string,
    public initiative: number,
    public weaknesses: string[],
    public immunities: string[]
  ) {}

  selectTarget(targets: ArmyUnit[]) {
    // Only targets that aren't targeted by others and which can be damaged can be targeted
    targets = targets.filter(
      target =>
        !target.targetedBy &&
        target.damageFrom(this.effectivePower, this.damageType)
    );
    targets.sort((target1, target2) => {
      const damage1 = target1.damageFrom(this.effectivePower, this.damageType);
      const damage2 = target2.damageFrom(this.effectivePower, this.damageType);
      if (damage1 > damage2) {
        return -1;
      } else if (damage1 === damage2) {
        if (target1.effectivePower > target2.effectivePower) {
          return -1;
        } else if (target1.effectivePower === target2.effectivePower) {
          return target1.initiative > target2.initiative ? -1 : 1;
        }
      }
      return 1;
    });

    this.target = targets[0];
    if (this.target) {
      this.target.targetedBy = this;
      if (this.target.damageFrom(this.effectivePower, this.damageType) <= 0) {
        throw 'e2';
      }
    }
  }

  attack() {
    const target = this.target;
    if (!target) {
      return;
    }
    const damage = target.damageFrom(this.effectivePower, this.damageType);
    target.numberOfUnits = Math.max(
      0,
      target.numberOfUnits - Math.floor(damage / target.hitPoints)
    );
  }

  get effectivePower() {
    return this.numberOfUnits * this.damageValue;
  }

  damageFrom(effectivePower: number, damageType: string) {
    if (this.weaknesses.includes(damageType)) {
      return effectivePower * 2;
    } else if (this.immunities.includes(damageType)) {
      return 0;
    } else {
      return effectivePower;
    }
  }

  reset() {
    this.target = undefined;
    this.targetedBy = undefined;
  }
}

part1(input);
part2(input);

function part1(inputStr: string) {
  const armiesInput = inputStr.split('\n\n');

  const armies = armiesInput
    .map(str => str.split(':\n')[1])
    .map(str => str.split('\n').map(strToArmyUnit));

  const battle = new Battle(armies[0], armies[1]);
  battle.playBattle();

  console.log(
    'Part 1',
    Math.max(
      battle.getTotalUnits(battle.immuneArmy),
      battle.getTotalUnits(battle.infectionArmy)
    )
  );
}

function part2(inputStr: string) {
  const armiesInput = inputStr.split('\n\n').map(str => str.split(':\n')[1]);

  let boost = 1;
  let previousBoosts: number[] = [];
  let smallestBoost = Infinity;

  // Uses binary-like search to get rough estimate on boost value, after which final result is searched linearly
  // Binary search is not used all the way because higher boost doesn't always end up in victory, due to stalemates
  // There is a chance that solution won't work on all inputs because of this.
  // The solution for this particular input was quite small, so this hasn't been tested with inputs that require
  // bigger solutions.
  while (true) {
    const armies = armiesInput.map(str => str.split('\n').map(strToArmyUnit));
    const battle = new Battle(armies[0], armies[1], boost);
    battle.playBattle();
    if (battle.infectionArmy.length === 0) {
      // Battle won
      smallestBoost = boost;
      const previousBoost = previousBoosts[previousBoosts.length - 1];

      if (previousBoost > boost) {
        // Only smaller winning boost values are of interest, so bigger one can be removed.
        previousBoosts.pop();
      }
      // Go backwards, middle point of current boost and previous non-winning boost
      boost = Math.floor(
        (boost + previousBoosts[previousBoosts.length - 1]) / 2
      );
      previousBoosts.push(smallestBoost);

      if (
        boost >= smallestBoost ||
        boost === previousBoost ||
        smallestBoost === previousBoost
      ) {
        // Smallest boost found
        break;
      }
    } else {
      // Battle lost
      if (smallestBoost === Infinity) {
        // Find first victory boost value quickly by going through power of 2 values
        // This will be stopped once first victory value is found
        previousBoosts.push(boost);
        boost *= 2;
      } else {
        if (smallestBoost < boost) {
          // At this stage values are iterated linearly. If match is found,
          // iteration can be stopped
          break;
        }
        // At this point a victory value has been found, boost iterator has been set to
        // earlier non-victory value. At this point values will be linearly iterated until
        // lowest vicotyr value gets found
        previousBoosts.push(boost);
        boost++;
      }
    }
  }
  // Calculate battle result again with the smallest boost
  {
    const armies = armiesInput.map(str => str.split('\n').map(strToArmyUnit));
    const battle = new Battle(armies[0], armies[1], smallestBoost);
    battle.playBattle();
    console.log('Part 2', battle.getTotalUnits(battle.immuneArmy));
  }
}

function strToArmyUnit(str: string) {
  const [
    ,
    numberOfUnits,
    hitPoints,
    weaknessAndImmunityStr,
    damageValue,
    damageType,
    initiative
  ] = str.match(
    /(\d+) units each with (\d+) hit points (?:\(([^)]+)\) )?with an attack that does (\d+) (\w+) damage at initiative (\d+)/
  );

  let weaknesses: string[] = [];
  let immunities: string[] = [];

  if (weaknessAndImmunityStr && weaknessAndImmunityStr.includes('weak to')) {
    const weaknessStr = weaknessAndImmunityStr.match(/weak to ([^;]+)/)[1];
    weaknesses = weaknessStr.split(', ');
  }
  if (weaknessAndImmunityStr && weaknessAndImmunityStr.includes('immune to')) {
    const immunitiesStr = weaknessAndImmunityStr.match(/immune to ([^;]+)/)[1];
    immunities = immunitiesStr.split(', ');
  }
  return new ArmyUnit(
    +numberOfUnits,
    +hitPoints,
    +damageValue,
    damageType,
    +initiative,
    weaknesses,
    immunities
  );
}
