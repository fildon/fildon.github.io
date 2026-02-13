---
title: Generics aren't as scary as you think
description: Learn TypeScript generics through familiar examples like Arrays and Promises. Discover how you're already using generics without realizing it.
date: 2021-05-23
layout: layouts/post.njk
---

I'll be demonstrating generics using TypeScript, but the core principles of generics are the same in any programming language.

## First things first

_You already understand generics... you just don't know you do._

- If you ever use promises **you are already using generics**
- If you ever use any array method **you are already using generics**

## What is a Generic?

A generic is a type containing some information about another type _which isn't specified yet_.

Don't worry if that doesn't make sense yet. We are going to walk through some examples and build up a feeling for what this means.

Let's look at a concrete example that should be familiar to everyone: _Arrays_

## Arrays are Generic

The easiest way to demonstrate that Arrays are generic is to look at how existing array methods would need to be implemented. Let's take for example `Array.prototype.filter`.

First a refresher on how `filter` works. Given some callback function, return a new array containing only the elements in the array for which the callback function returns true.

Here's a simple example in which we want to get only the big numbers in an array:

```ts
const numbers = [1, 31, 12, 40];
const bigNumbers = numbers.filter((n) => n > 20);
console.log(bigNumbers); // prints [31, 40]
```

Now let's pretend `filter` didn't already exist, and we wanted to make our own function from scratch. What type should our new filter function be? It will need to take an array to work on, and some sort of callback to use on each element in the array. Let's make a simplifying assumption here and say we only want this new filter to work on arrays of numbers. Then the array we take is of type `Array<number>` and the callback is of type `(num: number) => boolean`. That should be enough to get us started:

```ts
function numberFilter(
	array: Array<number>,
	callback: (num: number) => boolean,
) {
	const result: Array<number> = [];
	for (const num of array) {
		if (callback(num)) {
			result.push(num);
		}
	}
	return result;
}

const numbers = [1, 31, 12, 40];
const bigNumbers = numberFilter(numbers, (n) => n > 20);
console.log(bigNumbers); // prints [31, 40]
```

Excellent! This works. We can use it to filter an array of numbers using any sort of callback that picks some numbers and not others.

But notice how at no point in our filter function do we really care that `num` is a number. We don't do any sort of addition or subtraction, or use that number in any way that is specific to a number. In fact `num` in the above example could be any type and our filter would work exactly the same.

To really prove this point, lets show what a custom string filter function might look like:

```ts
function stringFilter(
	array: Array<string>,
	callback: (num: string) => boolean,
) {
	const result: Array<string> = [];
	for (const str of array) {
		if (callback(str)) {
			result.push(str);
		}
	}
	return result;
}

const strings = ["cat", "horse", "dog", "dinosaur"];
const bigStrings = stringFilter(strings, (str) => str.length > 3);
console.log(bigStrings); // prints ["horse", "dinosaur"]
```

Aside from renaming 'num' to 'str' _this is exactly the same implementation._

What if we could abstract the implementation from the specific type of element that gets filtered? We still have to specify a type for the array, and a type for the argument that our callback will use... but we don't care _specifically_ what type, only that the type must match. Let's just call this type we don't care about "T" (for "type").

```ts
function genericFilter<Element>(
	array: Array<Element>,
	callback: (element: Element) => boolean,
) {
	const result: Array<T> = [];
	for (const element of array) {
		if (callback(element)) {
			result.push(element);
		}
	}
	return result;
}

// Works with numbers!
const numbers = [1, 31, 12, 40];
const bigNumbers = genericFilter(numbers, (n) => n > 20);
console.log(bigNumbers); // prints [31, 40]

// Also works with strings!
const strings = ["cat", "horse", "dog", "dinosaur"];
const bigStrings = genericFilter(strings, (str) => str.length > 3);
console.log(bigStrings); // prints ["horse", "dinosaur"]
```

This is the exact same implementation again. The only thing we had to add was a peculiar `<Element>` annotation to the end of the function name. If we didn't add this, TypeScript would complain as soon as it sees us use `Element` and say something to the effect of "I don't know what type Element is". By adding `<Element>` to the function name we are telling TypeScript that we intend to use `Element` as a symbol for a type _which isn't specified yet._ As soon as we invoke our filter however, we pass in an array with some specific type and only then does the type get fully specified. This is why we can use this same function to handle arrays of numbers or arrays of strings... or arrays of anything!

## This is only the beginning

In the above examples we have walked through the process of creating a generic function. TypeScript also supports generic types and generic classes, and a handful of other features that support working with generics.

For example here is how you can implement a generic type declaration:

```ts
// A Pair is a tuple with two values of the same type
type Pair<Type> = [Type, Type];

// Then a coordinate is just a pair of numbers
type Coordinate = Pair<number>;

// Or a timespan is a pair of dates
type TimeSpan = Pair<Date>;
```

But this is really only beginning to scratch the tip of the iceberg. If you'd like to advance your understanding of generics even further, I highly recommend getting familiar with TypeScript's generic type constraints system in which you can express limitations on a generic type while still leaving it very flexible.

In this post we worked through establishing that array methods are generic and how we would implement our own generic function from scratch. So to end how I began:

> _You already understand generics... and now you know you do._
