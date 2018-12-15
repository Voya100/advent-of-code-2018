// value function must return a number when it takes value from array as parameter
export function findMax<T>(
  array: T[],
  valueFunction: (obj: T) => number,
  startMax = 0
) {
  let max = startMax;
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

export function findMin<T>(
  array: T[],
  valueFunction: (obj: T) => number,
  startMin = Infinity
) {
  return findMax(array, (element: T) => -1 * valueFunction(element), -startMin);
}

// Returns all elements from array that get (same) highest value from valueFunction
export function findAllMax<T>(
  array: T[],
  valueFunction: (obj: T) => number,
  startMax = 0
) {
  let max = startMax;
  let results: T[] = [];

  for (let element of array) {
    const value = valueFunction(element);
    if (value > max) {
      max = value;
      results = [element];
    } else if (value === max) {
      results.push(element);
    }
  }
  return results;
}
