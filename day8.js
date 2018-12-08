// https://adventofcode.com/2018/day/8

const fs = require("fs");

const input = fs.readFileSync("inputs/day8.txt", "utf8");
//const input = "2 3 0 3 10 11 12 1 1 0 1 99 2 1 1 2";
const numbers = input.split(" ").map(str => +str);

const [tree] = getNode(numbers, 0);

const metadataSum = getTotalMetadataSum(tree);
console.log("Part 1", metadataSum);

const treeValue = getNodeValue(tree);
console.log("Part 2", treeValue);

/**
  @typedef Node
  @type { { metadata: number[], children: Node[], value?: number } }
 /

/**
 * @param { number[] } numbers
 * @param { number } indexPosition
 * @returns { [Node, number] } [node, endIndexPosition]
 */
function getNode(numbers, indexPosition, depth = 0) {
  const numberOfChildren = numbers[indexPosition];
  const numberOfMetaData = numbers[indexPosition + 1];
  const children = [];
  let position = indexPosition + 2;

  // Initialize children
  for (let i = 0; i < numberOfChildren; i++) {
    const [child, endPosition] = getNode(numbers, position, depth + 1);
    children.push(child);
    position = endPosition + 1;
  }
  const metadata = numbers.slice(position, position + numberOfMetaData);
  const node = { children, metadata };
  return [node, position + numberOfMetaData - 1];
}

/**
 * Returns recursively calculated sum
 * @param { Node } node
 */
function getTotalMetadataSum(node) {
  const childSum = node.children.reduce(
    (sum, child) => sum + getTotalMetadataSum(child),
    0
  );
  const metadataSum = getMetadataSum(node);
  return childSum + metadataSum;
}

// Non-recursive sum
function getMetadataSum(node) {
  return node.metadata.reduce((sum, metadata) => sum + metadata, 0);
}

/**
 * @param { Node } node
 */
function getNodeValue(node) {
  // If no children, value comes from metadata
  if (node.children.length === 0) {
    return getMetadataSum(node);
  }
  // Otherwise metadata is child indices, sum values of which is value
  return node.metadata.reduce((sum, index) => {
    if (index > node.children.length) {
      // Metadata index value is too high, index is skipped
      return sum;
    }
    const child = node.children[index - 1];
    // Optimization so that same node value only needs to be calculated once.
    if (child.value === undefined) {
      child.value = getNodeValue(child);
    }
    return sum + child.value;
  }, 0);
}
