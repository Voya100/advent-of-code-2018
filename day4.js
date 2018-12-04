// https://adventofcode.com/2018/day/4

const fs = require("fs");
const input = fs.readFileSync("inputs/day4.txt", "utf8");

const records = input.split("\n");

// Sort into chronological order
records.sort();

const guards = getGuardsFromRecords(records);

function getGuardsFromRecords(records) {
  const guards = {};
  let guard = {};
  let sleepStart = 0;

  for (let record of records) {
    const guardBeginsShift = record.match(/Guard #(\d+) begins shift/);

    if (guardBeginsShift) {
      const id = guardBeginsShift[1];
      if (!guards[id]) {
        guards[id] = {
          id: id,
          totalSleep: 0,
          sleepedMinutes: []
        };
      }
      guard = guards[id];
      continue;
    }

    const minute = parseInt(record.substr(15, 2));
    const fallsAsleep = record.includes("falls asleep");
    if (fallsAsleep) {
      sleepStart = minute;
    } else {
      // Awakes
      const sleepEnd = minute;
      const sleepDuration = sleepEnd - sleepStart;
      // Minutes 0-59 during which guard slept
      const minutesSlept = Array.from(
        { length: sleepDuration },
        (_, i) => sleepStart + i
      );
      guard.totalSleep += sleepDuration;
      guard.sleepedMinutes.push(...minutesSlept);
    }
  }
  // Convert object to array
  return Object.values(guards);
}

const sleepiestGuard = findMax(guards, guard => guard.totalSleep);

// value function must return a number when it takes value from array as parameter
function findMax(array, valueFunction) {
  let max = 0;
  let result = array[0];

  for (let element of array) {
    const value = valueFunction(element);
    if (value > max) {
      max = value;
      result = element;
    }
  }
  return result;
}

const guardsMostSleepedMinute = mostSleepedMinute(sleepiestGuard).minute;
console.log("part 1", sleepiestGuard.id * guardsMostSleepedMinute);

// Returns { minute, minuteFrequency }
function mostSleepedMinute(guard) {
  // Find counts for each minute
  const minuteCounts = guard.sleepedMinutes.reduce((result, minute) => {
    result[minute] = result[minute] === undefined ? 1 : result[minute] + 1;
    return result;
  }, {});

  const [minute, frequency] = findMax(
    Object.entries(minuteCounts),
    ([minute, frequency]) => frequency
  ) || [0, 0];
  return { minute, frequency };
}

// Add most sleeped minute information for each guard
guards.forEach(guard => (guard.mostSleepedMinute = mostSleepedMinute(guard)));

const sleepiestGuardOnSameMinute = findMax(
  guards,
  guard => guard.mostSleepedMinute.frequency
);

console.log(
  "part 2",
  sleepiestGuardOnSameMinute.id *
    sleepiestGuardOnSameMinute.mostSleepedMinute.minute
);
