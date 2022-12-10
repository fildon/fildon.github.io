---
title: Advent of Code 2022
description: A friendly guide to AoC puzzles.
date: 2022-12-01
layout: layouts/post.njk
---

Advent of Code is:

> an Advent calendar of small programming puzzles for a variety of skill sets and skill levels that can be solved in any programming language you like.

This blog post will present my solutions and explanations to each puzzle in 2022.

I've hidden each solution inside its own `details` element, so you won't spoil anything for yourself by just scrolling down.

[Advent of Code 2022](https://adventofcode.com/2022)

## Day 01: Calorie Counting

[Day 01 Puzzle Text](https://adventofcode.com/2022/day/1)

The elves want to assess how much food they are carrying. To figure this out we have been provided a list of all their food. Each line is either blank or a number of calories for a given food item. The blank lines represent the separator between one elf's inventory and the next.

<details>
  <summary><strong>[Click to expand]</strong> my approach and solution</summary>

So generally I want to add up numbers, but start a new count each time I encounter a blank line.

I chose to model this as an array of numbers, each representing the total calories held by one elf. Rather than append new entries to the end, I push them on to the front since this means the "current" inventory is always the one at the front. This way I avoid needing to fiddle around with array lengths to get the last element in an arary.

To parse our input data into this model, I use a reducer. On each line:

- If the line is empty: Start a new entry in our model by pushing the value `0` into the front of the array.

```ts
[0, currentInventory, ...otherInventories];
```

- If the line is non-empty: Add the value of this line to the "current" inventory by adding its value to the first value in the array.

```ts
[currentInventory + parseInt(line), ...otherInventories];
```

Once I have the data in this format, both parts are trivial.

Part 1 wants the largest single value, so I use another reducer to scan the array and hold onto the largest value as it goes.

```ts
getElfInventories(getInputStrings(filePath)).reduce(
	(greatest, elf) => Math.max(greatest, elf),
	-Infinity
);
```

Part 2 wants the sum of the three largest values, so I do a descending sort and slice off the first three values.

```ts
getElfInventories(getInputStrings(filePath))
	// Descending sort, puts largest values at the beginning
	.sort((a, b) => b - a)
	// Take the first/largest three
	.slice(0, 3)
	// Sum
	.reduce((acc, curr) => acc + curr);
```

[Full Day 01 Source Code](https://github.com/fildon/AdventOfCode2022/blob/main/src/01-calorie-counting/solutions.ts)

</details>

## Day 02: Rock Paper Scissors

[Day 02 Puzzle Text](https://adventofcode.com/2022/day/1)

The elves are going to play a Rock Paper Scissors tournament. But you have a cheatsheet which can guarantee victory.

Each line of the input is a pair of letters representing the move your opponent will play and the move you should play in response.

The elves have their own scoring system for Rock Paper Scissors. Our task is to figure out how much we will score by following the provided cheatsheet.

<details>
  <summary><strong>[Click to expand]</strong> my approach and solution</summary>

This task is a series of lookups.

- First lookup the move each letter in the input represents
- Then lookup the score provided by the move you played
- Finally lookup the score provided by the result for that round

For part 1, I implemented the three lookups in three different ways, just to amuse myself. The first I use a switch statement, the second an `Array.prototype.indexOf` and the third a regular object.

First lookup:

```ts
/**
 * A for Rock, B for Paper, and C for Scissors.
 * X for Rock, Y for Paper, and Z for Scissors.
 */
const parseLetter = (letter: string): Shape => {
	switch (letter) {
		case "A":
		case "X":
			return "Rock";
		case "B":
		case "Y":
			return "Paper";
		default:
			return "Scissors";
	}
};
```

Second lookup:

```ts
/**
 * 1 for Rock, 2 for Paper, and 3 for Scissors
 */
const shapeScore = (shape: Shape): number =>
	["Rock", "Paper", "Scissors"].indexOf(shape) + 1;
```

Third lookup:

```ts
/**
 * 0 if you lost, 3 if the round was a draw, and 6 if you won
 */
const outcomeScore = ([theirPlay, myPlay]: Round): number => {
	const outcomeMap: Record<Shape, Record<Shape, number>> = {
		Rock: { Rock: 3, Paper: 6, Scissors: 0 },
		Paper: { Rock: 0, Paper: 3, Scissors: 6 },
		Scissors: { Rock: 6, Paper: 0, Scissors: 3 },
	};
	return outcomeMap[theirPlay][myPlay];
};
```

For part 2 it is revealed that we need to decrypt the instructions before using them directly. This only slightly changes the behaviour of the first lookup.

```ts
/**
 * X means you need to lose,
 * Y means you need to end the round in a draw,
 * and Z means you need to win.
 */
const decryptRound = (line: string): Round => {
	const [theirLetter, myLetter] = line.split(" ");
	const theirPlay = parseLetter(theirLetter);
	const decryptionMap: Record<Shape, Record<string, Shape>> = {
		Rock: { X: "Scissors", Y: "Rock", Z: "Paper" },
		Paper: { X: "Rock", Y: "Paper", Z: "Scissors" },
		Scissors: { X: "Paper", Y: "Scissors", Z: "Rock" },
	};
	return [theirPlay, decryptionMap[theirPlay][myLetter]];
};
```

[Full Day 02 Source Code](https://github.com/fildon/AdventOfCode2022/blob/main/src/02-rock-paper-scissors/solutions.ts)

</details>

## Day 03: Rucksack Reorganization

[Day 03 Puzzle Text](https://adventofcode.com/2022/day/3)

The elves have loaded up their rucksacks for the journey ahead, but they've made a mistake! Your task is to find the mistakes.

<details>
  <summary><strong>[Click to expand]</strong> my approach and solution</summary>

In part one, we are looking for the letter that appears in the first and last half of each input line. To assist with this I implemented a general purpose duplicate finder. Finding duplicates is equivalent to repeated set intersection.

I implement this by mapping all the containers to sets and then using the intersect function to reduce them all to one set. I then map the result back into an array for convenience.

```ts
/**
 * Given sets A and B, return the set of their intersection
 */
const intersect = <Element>(a: Set<Element>, b: Set<Element>) =>
	new Set([...a.values()].filter((value) => b.has(value)));

/**
 * Find all elements that appear in all provided containers
 */
const findDuplicates = <Element>(containers: Element[][]) =>
	Array.from(
		containers.map((container) => new Set(container)).reduce(intersect)
	);
```

Other than that we need some boiler plate code to parse the input into "Containers" (arrays of characters) and scoring the duplicates we find according to the elves' system.

Once put together the part 1 solution is a simple pipeline:

```ts
export const solvePart1 = (filePath: string) =>
	getInputStrings(filePath)
		.map(toContainers)
		.map(getRucksackPriority)
		.reduce((a, b) => a + b);
```

For part two we are now looking for duplicates in each group of three input lines. So the only new code we will need is a way to group in batches of three. A reduce will come in handy here. The trick here is treating the head of our accumulator as our "working group" which we push containers into. Once the "working group" has three containers, we start a new group at the head of the accumulator.

```ts
/**
 * Group containers in batches of three
 */
const group = ([currentGroup, ...otherGroups]: Group[], rucksack: Container) =>
	currentGroup.length < 3
		? [[rucksack, ...currentGroup], ...otherGroups]
		: [[rucksack], currentGroup, ...otherGroups];
```

Once again, our solution is now a simple pipeline:

```ts
export const solvePart2 = (filePath: string) =>
	getInputStrings(filePath)
		.map(toContainers)
		.reduce(group, [[]]) // Second arg is the initially empty group
		.map(getGroupPriority)
		.reduce((a, b) => a + b);
```

[Full Day 03 Source Code](https://github.com/fildon/AdventOfCode2022/blob/main/src/03-rucksack-reorganization/solutions.ts)

</details>

## Day 04: Camp Cleanup

[Day 04 Puzzle Text](https://adventofcode.com/2022/day/4)

The elves are cleaning up camp by assigning sections of the camp to clean. However some of the assignments overlap with others. Our task is to find these overlaps so they can avoid duplicating work.

<details>
  <summary><strong>[Click to expand]</strong> my approach and solution</summary>

There's very little logic to do in this puzzle. Most of the work is parsing the input. I chose to parse each line into a pair of pair of numbers. Here's my data type:

```ts
type Range = [number, number];
type RangePair = [Range, Range];
```

To parse each line we first split by `,` and then by `-`. Since splitting a string returns an array, I also created a type predicate to narrow from an array to a 2-tuple:

```ts
/**
 * A little utility to narrow from an array to a tuple of length 2
 */
const isPair = <T>(elements: T[]): elements is [T, T] => elements.length === 2;
```

This means I now get a little validation on each parsing step:

```ts
/**
 * Parse strings of the form "3-42" to Range
 */
const toRange = (instruction: string): Range => {
	const bounds = instruction.split("-").map((str) => parseInt(str));
	if (isPair(bounds)) return bounds;
	throw new Error(`Unrecognised instruction: ${instruction}`);
};

/**
 * Parse strings of the form "1-12,3-42" to RangePair
 */
const toRangePair = (line: string): RangePair => {
	const nums = line.split(",").map(toRange);
	if (isPair(nums)) return nums;
	throw new Error(`Unrecognised line: ${line}`);
};
```

The only thing remaining is to identify which pairs overlap. This can be done with a oneliner:

```ts
/**
 * Returns true if either range fully overlaps the other
 */
const fullyOverlaps = ([[aStart, aEnd], [bStart, bEnd]]: RangePair): boolean =>
	(aStart <= bStart && aEnd >= bEnd) || (bStart <= aStart && bEnd >= aEnd);
```

The left half of that expression handles the case in which `a` fully overlaps `b`, and the right half handles the case in which `b` fully overlaps `a`.

We now assemble the solution to part 1 as a pipeline:

```ts
export const solvePart1 = (filePath: string) =>
	getInputStrings(filePath).map(toRangePair).filter(fullyOverlaps).length;
```

Part 2 changes only one thing. We are now asked to count any kind of overlap. This requires only a slight modification to our overlapping check. Here's all I had to add for part 2:

```ts
/**
 * Returns true if there is any overlap at all between the two ranges
 */
const partiallyOverlaps = ([
	[aStart, aEnd],
	[bStart, bEnd],
]: RangePair): boolean =>
	(aStart <= bEnd && aEnd >= bStart) || (bStart <= aEnd && bEnd >= aStart);

export const solvePart2 = (filePath: string) =>
	getInputStrings(filePath).map(toRangePair).filter(partiallyOverlaps).length;
```

[Full Day 04 Source Code](https://github.com/fildon/AdventOfCode2022/blob/main/src/04-camp-cleanup/solutions.ts)

</details>

## Day 05: Supply Stacks

[Day 05 Puzzle Text](https://adventofcode.com/2022/day/5)

The elves are unloading shipping crates with a giant cargo crane. Given the current stacks of crates and a list of crane instructions, our task is to find the end state of the stacks.

<details>
  <summary><strong>[Click to expand]</strong> my approach and solution</summary>

This task has three interesting stages:

- Decide on an appropriate data structure
- Parse the input into our data structure
- Execute the crane instructions

Our chosen data structure will need a way to represent a collection of stacks, where each stack is itself a collection of crates. Crates are distinguished only by a single letter. An array of arrays of strings will fit the requirements nicely.

We'll also need to represent all the crane instructions. The instructions are a list, where each item has three interesting pieces of information: the quantity, the source stack and the target stack. To me, this screams "array of objects".

Put together, my data structure is:

```ts
type Stacks = Array<Array<string>>;
type Instruction = {
	qty: number;
	from: number;
	to: number;
};
type CraneJob = { stacks: Stacks; instructions: Instruction[] };
```

The next stage of this task is parsing our input into this structure. _This was very tedious and error prone_. There are lots of potential foot guns here.

- The stacks are "columns" in the input but we would much rather they were in "rows".
- There are many symbols we don't want.
- The instructions are 1-indexed, but we would rather have 0-indexing.

The neatest way I found to do the stacks was as follows:

```ts
stackLines.forEach((line) =>
	line
		.split("")
		// Fetch only the relevant input columns
		.filter((_, i) => i % 4 === 1)
		// Push only the non-empty items to their columns
		.forEach((char, i) => char !== " " && stacks[i].push(char))
);
```

Note in particular the modulo: `i % 4 === 1`. This retrieves the value in the input column at index 1 and then ever 4th column after that. This lines up exactly with the character labels for the crates. Some positions are empty however, and so we also need to skip those rather than push empty symbols onto our internal stacks data structure.

I use a similar code pattern for the instruction parsing:

```ts
const instructions = instructionLines
	.map((line) =>
		line
			.split(" ")
			.filter((_, i) => i % 2 === 1)
			.map((val) => parseInt(val))
	)
	// -1 to transform from 1-index to 0-index
	.map(([qty, from, to]) => ({ qty, from: from - 1, to: to - 1 }));
```

Seriously... that's the hard stuff done 😅, everything after this point was straight forward.

In order to execute an instruction we need a way to apply an instruction to a given stacks state and produce a new stacks state. The gist of which is this:

```ts
const movingSlice = stacks[from].slice(0, qty).reverse();

return stacks.map((stack, i) =>
	i === from
		? stack.slice(qty) // Remove the moving slice from the from column
		: i === to
		? [...movingSlice, ...stack] // Push moving slice on top of the stack
		: stack
);
```

Then producing the final stacks state is a matter of applying a reduce over the instructions list and the starting state:

```ts
return instructions
	.reduce(executeInstruction, stacks)
	.map(([top]) => top)
	.join("");
```

The map and join calls there handle reading the answer off the top of each stack.

And that's part 1!

Part 2 is an easy change with a copy+paste of the part 1 solution, and a one line alteration of the `executeInstruction` implementation. But for neatness I chose to pull out this behaviour difference by way of a curried function.

```ts
const solve =
	({ withMultiMove }: { withMultiMove: boolean }) =>
	(filePath: string) => {
		const { stacks, instructions } = parseFile(filePath);

		return instructions
			.reduce(executeInstruction({ withMultiMove }), stacks)
			.map(([top]) => top)
			.join("");
	};
```

This then gives me the power to create my part 1 solver and part 2 solver using this same curried function:

```ts
export const solvePart1 = solve({ withMultiMove: false });
export const solvePart2 = solve({ withMultiMove: true });
```

[Full Day 05 Source Code](https://github.com/fildon/AdventOfCode2022/blob/main/src/05-supply-stacks/solutions.ts)

</details>

## Day 06: Tuning Trouble

[Day 06 Puzzle Text](https://adventofcode.com/2022/day/6)

The Elves have given us a handheld communication device. It is receiving a stream of data, but we need to identify start-of-packet markers in the stream.

<details>
  <summary><strong>[Click to expand]</strong> my approach and solution</summary>

Part 1 requires us to find the first occurance of 4 adjacent unique symbols. Actually counting and tracking uniqueness among four symbols would be tedious, but there is a quick trick for this: put them all in a Set and confirm that the Set has four members. If any were duplicates then the Set's size will be less than four. Now all we have to do is scan over the input with this approach, and return the first match:

```ts
export const solvePart1 = (filePath: string): number => {
	const datastream = getInput(filePath);

	for (let i = 3; i < datastream.length; i++) {
		if (
			new Set([
				datastream[i - 3],
				datastream[i - 2],
				datastream[i - 1],
				datastream[i],
			]).size === 4
		) {
			return i + 1;
		}
	}

	throw new Error("No marker found");
};
```

When I wrote this, I recognised that hard-coding it for a window size of 4 could be a problem, and I assumed that part 2 would force me to drastically rethink this approach. But no! The only change for part 2 is that the window is now length 14. Out of some dumb stubbornness I copied my part 1 approach but just hardcoded a longer window 🙈

```ts
export const solvePart2 = (filePath: string): number => {
	const datastream = getInput(filePath);

	for (let i = 13; i < datastream.length; i++) {
		if (
			new Set([
				datastream[i - 13],
				datastream[i - 12],
				datastream[i - 11],
				datastream[i - 10],
				datastream[i - 9],
				datastream[i - 8],
				datastream[i - 7],
				datastream[i - 6],
				datastream[i - 5],
				datastream[i - 4],
				datastream[i - 3],
				datastream[i - 2],
				datastream[i - 1],
				datastream[i],
			]).size === 14
		) {
			return i + 1;
		}
	}

	throw new Error("No marker found");
};
```

It ain't pretty or elegant, but it works 😅

[Full Day 06 Source Code](https://github.com/fildon/AdventOfCode2022/blob/main/src/06-tuning-trouble/solutions.ts)

</details>
