// value function must return a number when it takes value from array as parameter
function findMax(array, valueFunction, startMax = 0) {
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

// Returns all elements from array that get (same) highest value from valueFunction
function findAllMax(array, valueFunction, startMax = 0) {
  let max = startMax;
  let results = [];

  for (let element of array) {
    const value = valueFunction(element);
    if (value > max) {
      max = value;
      results = [element];
    } else if (value === max) {
      results.push(value);
    }
  }
  return results;
}

module.exports = {
  findMax,
  findAllMax
};
