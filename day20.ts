// https://adventofcode.com/2018/day/20
import * as fs from 'fs';

const input = fs.readFileSync('inputs/day20.txt', 'utf8');

// Strip ^ and $ symbols from start/end
const regex = input.slice(1, input.length - 1);
const N = 'N';
const E = 'E';
const S = 'S';
const W = 'W';

const DIRECTIONS = [N, E, S, W];

const OPPOSITE_DIRECTIONS: { [key: string]: string } = {
  N: S,
  S: N,
  E: W,
  W: E
};

class Room {
  static rooms: Map<string, Room> = new Map();

  adjacentRooms: [Room, string][] = [];

  // Used for BFS algorithm
  checked = false;

  static getOrCreateRoom(x: number, y: number) {
    return this.rooms.get(x + ',' + y) || new Room(x, y);
  }

  static uncheckAll() {
    for (let room of this.rooms.values()) {
      room.checked = false;
    }
  }

  constructor(public x: number, public y: number) {
    Room.rooms.set(x + ',' + y, this);
  }

  addAdjacentRoom(room: Room, direction: string) {
    this.adjacentRooms.push([room, direction]);
  }
  // Creates room to direction (if not already created) and adds connections
  // between them
  createRoom(direction: string) {
    let room: Room;
    if (direction === N) {
      room = Room.getOrCreateRoom(this.x, this.y + 1);
    } else if (direction === E) {
      room = Room.getOrCreateRoom(this.x + 1, this.y);
    } else if (direction === S) {
      room = Room.getOrCreateRoom(this.x, this.y - 1);
    } else if (direction === W) {
      room = Room.getOrCreateRoom(this.x - 1, this.y);
    }
    if (this.adjacentRooms.some(([adjRoom]) => adjRoom === room)) {
      // Room already created and has connection to room => skip
      return room;
    }
    this.addAdjacentRoom(room, direction);
    room.addAdjacentRoom(this, OPPOSITE_DIRECTIONS[direction]);
    return room;
  }

  // Returns [furthestRooms, depth, numberOfRoomsUntilDepth]
  findFurthest(maxDepth = Infinity): [Room[], number, number] {
    // Reset previous checks
    Room.uncheckAll();

    let currentRooms: Room[] = [this];
    let depth = 0;
    let roomCounter = 1;
    while (true) {
      // Get rooms on next depth level
      const nextRooms = [];
      for (let room of currentRooms) {
        const adjacentRooms = room.adjacentRooms
          .map(([adjRoom]) => adjRoom)
          .filter(adjRoom => !adjRoom.checked);
        nextRooms.push(...adjacentRooms);
        room.checked = true;
      }
      roomCounter += nextRooms.length;
      if (nextRooms.length) {
        currentRooms = nextRooms;
      } else {
        // All rooms have been checked, iteration can end
        break;
      }
      depth++;
      if (depth === maxDepth) {
        break;
      }
    }
    return [currentRooms, depth, roomCounter];
  }
}

part1(regex);
part2();

function part1(regexInput: string) {
  const [options] = separateOptions(regexInput, 0);
  generateRooms(options);
  const [furthest, depth] = Room.getOrCreateRoom(0, 0).findFurthest();
  console.log('Part 1', depth);
}

function part2() {
  // Assumption: This gets called after part1, meaning that rooms have been
  // generated
  const [furthest, depth, roomsWithin1000] = Room.getOrCreateRoom(
    0,
    0
  ).findFurthest(999);
  console.log('Part 2', Room.rooms.size - roomsWithin1000);
}

interface Options extends Array<Options | string> {}

function generateRooms(
  options: Options,
  optionIndex = 0,
  currentRoom = new Room(0, 0),
  handledRoomOptions = new Set<string>()
): Room[] {
  // There is a mysterious infinite (?) loop somewhere source of which I haven't been able to find yet
  // By verifying that this function is not called multiple times
  // with identical parameters, loop is "fixed"
  // (As a bonus might act as a performance booster, in case input has
  // much repetivity)
  const str =
    JSON.stringify(options) +
    ',' +
    optionIndex +
    ',' +
    currentRoom.x +
    ',' +
    currentRoom.y;
  if (handledRoomOptions.has(str)) {
    // This call has been handled already => skip
    return [];
  } else {
    handledRoomOptions.add(str);
  }
  for (let i = optionIndex; i < options.length; i++) {
    const option = options[i];
    if (DIRECTIONS.includes(option as any)) {
      currentRoom = currentRoom.createRoom(option as string);
      continue;
    } else {
      // Option is not a direction, so it must be an array of possible options
      const rooms = [];
      if (option.length === 0) {
        continue;
      }
      // Iterate all provided options
      for (let childOption of option) {
        let optionRooms = generateRooms(
          childOption as Options,
          0,
          currentRoom,
          handledRoomOptions
        );
        if (options.length === i + 1) {
          continue;
        }
        // Once all possible option results have been obtained,
        // take each as starting point for rest of the directions
        for (let room of optionRooms) {
          rooms.push(
            ...generateRooms(options, i + 1, room, handledRoomOptions)
          );
        }
      }
      if (rooms.length === 0) {
        return [currentRoom];
      }
      return [...rooms];
    }
  }
  return [currentRoom];
}

// Split string into arrays in which inner arrays describe multiple options
function separateOptions(
  inputRegex: string,
  startIndex: number
): [Options, number] {
  let options: any[] = [];
  let optionContents: any[] = [];
  let hasPipes = false;
  let i;
  for (i = startIndex; i < inputRegex.length; i++) {
    const char = inputRegex[i];
    if (char === '(') {
      const [childOptions, endIndex] = separateOptions(inputRegex, i + 1);

      if (hasPipes) {
        optionContents.push(childOptions);
      } else {
        options.push(childOptions);
      }
      i = endIndex;
    } else if (char === ')') {
      break;
    } else if (char === '|') {
      if (!hasPipes) {
        options = [options];
        hasPipes = true;
      } else {
        options.push(optionContents);
        optionContents = [];
      }
    } else {
      if (hasPipes) {
        optionContents.push(char);
      } else {
        options.push(char);
      }
    }
  }
  if (hasPipes) {
    options.push(optionContents);
  }
  return [options, i];
}
