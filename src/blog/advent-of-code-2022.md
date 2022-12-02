---
title: Advent of Code 2022
description: My guide to solutions.
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

So generally we want to add up numbers, but start a new count each time we encounter a blank line.

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

Once we have the data is this format, both parts are trivial.

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
