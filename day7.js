// https://adventofcode.com/2018/day/7

const fs = require("fs");
const { findMin } = require("./helpers");

const input = fs.readFileSync("inputs/day7.txt", "utf8");
const instructions = input
  .split("\n")
  .map(str => str.match(/Step (.) must be finished before step (.)/).slice(1));

class Step {
  constructor(name) {
    /**
     * @type { Step[] }
     */
    this.requiredInSteps = [];
    this.totalSteps = 0;
    this.stepsLeft = 0;
    this.name = name;
    this.timeFinished = 0;
    // 60 seconds and ASCII value offset of 64
    this.timeRequired = name.charCodeAt(0) - 4;
  }

  // Decrements step counter for all steps that depend on this one
  completeStep() {
    for (let step of this.requiredInSteps) {
      step.stepsLeft--;
      if (step.stepsLeft === 0) {
        availableSteps.push(step);
      }
    }
  }

  reset() {
    this.stepsLeft = this.totalSteps;
    this.timeFinished = 0;
  }
}

/**
 * @type { { [key:string]: Step } }
 */
const steps = {};

// Initialize steps and add requirements for each step
for (let [step1Key, step2Key] of instructions) {
  const step1 = steps[step1Key] || (steps[step1Key] = new Step(step1Key));
  const step2 = steps[step2Key] || (steps[step2Key] = new Step(step2Key));
  step1.requiredInSteps.push(step2);
  step2.totalSteps++;
}

const stepsArray = Object.values(steps);
stepsArray.forEach(step => step.reset());

let availableSteps = stepsArray.filter(step => step.stepsLeft === 0);
let result = "";
while (availableSteps.length) {
  // Reverse order for easier popping
  availableSteps.sort((step1, step2) => (step1.name < step2.name ? 1 : -1));
  const availableStep = availableSteps.pop();
  availableStep.completeStep();
  result += availableStep.name;
}

console.log("Part 1", result);

let time = 0;
let workersAvailable = 6;
let stepsInProgress = [];

// Reset step state
stepsArray.forEach(step => step.reset());
availableSteps = stepsArray.filter(step => step.stepsLeft === 0);

while (availableSteps.length || stepsInProgress.length) {
  // Reverse order so that it's easy to pop from end
  availableSteps.sort((step1, step2) => (step1.name < step2.name ? 1 : -1));

  workersAvailable = assignWorkers(workersAvailable, availableSteps);

  const finishedStep = findMin(stepsInProgress, step => step.timeFinished);
  stepsInProgress = stepsInProgress.filter(step => step !== finishedStep);
  time = finishedStep.timeFinished;
  workersAvailable++;

  finishedStep.completeStep();
}

console.log("Part 2", time);

function assignWorkers(workersAvailable, steps) {
  while (workersAvailable && steps.length) {
    const step = steps.pop();
    step.timeFinished = time + step.timeRequired;
    stepsInProgress.push(step);
    workersAvailable--;
  }
  return workersAvailable;
}
