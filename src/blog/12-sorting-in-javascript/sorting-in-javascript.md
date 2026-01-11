---
title: Sorting in JavaScript
description: Typical use-cases and rare edge-cases.
date: 2022-01-17
layout: layouts/post.njk
---

JavaScript arrays have a builtin [sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) method, which mostly does what you expect:

```javascript
[1, 4, 2, 3].sort(); // [1, 2, 3, 4]
["d", "a", "b", "c"].sort(); // ['a', 'b', 'c', 'd']
```

But it has some quirks. For example: numbers are sorted _as though they were strings_, which is fine as long as all your numbers are the same length, but leads to unexpected behavior for numbers of different lengths:

```javascript
[2, 1, 10].sort(); // [1, 10, 2] Not what we wanted!
```

Likewise, the default ordering of strings is _usually_ OK, but can be unexpected in the case of non-ASCII characters, for example, letters with accents:

```javascript
["ä", "c", "b"].sort(); // ['b', 'c', 'ä' ] Maybe not what we wanted?
```

Additionally, the sorting is done _in place_. That means the original array is modified. Be sure that when you sort an array that modification doesn't have any side effects elsewhere.

## Primitive sort comparators

Fortunately, we can fix this by always providing an explicit comparator. To do this we pass a callback as an argument to the sort method. For numbers, we can use subtraction to get correct numerical ordering:

```javascript
[2, 1, 10].sort((a, b) => a - b); // [1, 2, 10] That's better!
```

This is necessary because in general JavaScript doesn't know _how_ you want your array to be ordered. You can think of your comparator callback then as being the answer to "Given any two items from the array, how should they _compare_ to each other in the order you want?". The value returned from your callback must be a number where:

- if `a` should come before `b` then return a negative value
- if `a` should come after `b` then return a positive value
- if `a` and `b` are of the same order then return zero

This is the minimum necessary information to define the desired ordering.

For strings we can use the [`String.prototype.localeCompare`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare)

```javascript
["ä", "b", "c"].sort((a, b) => a.localeCompare(b)); // ['ä', 'b', 'c']
```

Additionally, you can pass a specific locale since some locales sort differently to others:

```javascript
// German
["ä", "b"].sort((a, b) => a.localeCompare(b, "de")); // ['ä', 'b', 'c']

// Swedish
["ä", "b"].sort((a, b) => a.localeCompare(b, "sv")); // ['b', 'c', 'ä']
```

Reference [localeCompare#using_options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare#using_options)

## Sorting objects by property

So we can sort numbers and strings... but what about objects? For an array of objects we typically need to use some property of the object as part of the comparator. For example if we had some array of books, we might want to sort by publication date or by title:

```js
const sortedByDate = books.sort((a, b) => a.published - b.published);
const sortedByTitle = books.sort((a, b) => a.title.localeCompare(b.title));
```

Note that actually doing both sorts like this side by side would cause the second one to overwrite the first one because sorting is done _in place_ as mentioned earlier.

We can get around this by duplicating the array:

```js
const sortedByDate = [...books].sort((a, b) => a.published - b.published);
const sortedByTitle = [...books].sort((a, b) => a.title.localeCompare(b.title));
```

## Sorting by ascending or descending

Switching between ascending or descending is as simple as inverting the order of `a` and `b` in our comparator. For example:

```javascript
[2, 1, 10].sort((a, b) => a - b); // [1, 2, 10] ascending order
[2, 1, 10].sort((a, b) => b - a); // [10, 2, 1] descending order

books.sort((a, b) => a.published - b.published); // ascending by publication date
books.sort((a, b) => b.published - a.published); // descending by publication date
```

## Sorting by multiple properties

Often sorting by just one property is not enough. We might need a tiebreaker for items that would otherwise be sorted 'equally'. Consider for example our book collection which we want to sort by author, but then what about multiple books by the same author? I think it would be sensible to use the title as a tiebreaker. This way if you were looking for a particular book by a particular author, you could find it easily first by author then by title.

One way to do this is by relying on the short-circuiting behavior of the `||` (OR) operator.

```javascript
const sortedBooks = books.sort((a, b) => {
	return a.author.localeCompare(b.author) || a.title.localeCompare(b.title);
});
```

This works by first checking author's name. If they are different, then that value will be used right away. But if they are the same, then the value will be zero, and since zero is falsey then the right half of the expression will be used instead. So taken together, books will be sorted by author, but within a given author, books will be sorted by title.

This pattern is perfectly fine for a single fallback, and could even be extended to support more fallbacks:

```javascript
// Compare by author first, then by title, and finally by edition number
const sortedBooks = books.sort((a, b) => {
	return (
		a.author.localeCompare(b.author) ||
		a.title.localeCompare(b.title) ||
		a.edition - b.edition
	);
});
```

But you might also like to abstract this out to a reusable utility that takes a collection of comparators and uses them one after the other until it finds a non-zero result:

```typescript
const multiSort =
	<Item>(...comparators: Array<(a: Item, b: Item) => number>) =>
	(a: Item, b: Item) => {
		// Try each comparator in turn
		for (let comparator of comparators) {
			// Get its result
			const comparatorResult = comparator(a, b);
			// Return that result only if it is non-zero
			if (comparatorResult !== 0) return comparatorResult;
		}
		// All comparators returned zero, so these items cannot be distinguished
		return 0;
	};
```

We can then use this like so:

```javascript
const sortedBooks = books.sort(
	multiSort(
		(a, b) => a.title.localeCompare(b.title),
		(a, b) => a.published - b.published
	)
);
```

Which makes it quick and easy to rearrange or add and remove comparators. We could also pull out the comparators and test them in isolation if we wanted to.

## Ways to get it wrong

One time at a previous company I had a failing test on my machine, but no one else got the same test failure. The test failure corresponded to a snapshotted array sort output. After a lot of trial and error it turned out it was because I was running a different version of Node. But why would the version of Node affect the output of a sorting operation? The sort comparator being used was doing something rather naughty, but unfortunately common. It looked something like this:

```javascript
// Sort users by name, but put all nameless users at the end.
users.sort((a, b) => {
	// If a doesn't have a name...
	if (!a.name) return 1; // ...then a should go after b
	// If b doesn't have a name...
	if (!b.name) return -1; // ...then b should go after a
	// Otherwise compare by name
	return a.name.localeCompare(b.name);
});
```

Can you spot the mistake in this logic? What happens when both a and b do not have a name? Then this comparator declares that a should go before b, but that is not correct, they should be treated as equal. In general, you should avoid checking something about one of the values and not the other. Formally speaking this comparator breaks the _antisymmetric_ property of a total order. Which is a fancy way of saying "it's bad".

The mathematical concept of a [total order](https://en.wikipedia.org/wiki/Total_order) is what defines whether an ordering is consistent. It consists of four rules:

1. `a <= a` (_reflexive_)
2. if `a <= b` and `b <= c` then `a <= c` (_transitive_)
3. if `a <= b` and `b <= a` then `a = b` (_antisymmetric_)
4. `a <= b` or `b <= a` (_strongly connected_)

These rules are applied in the context of what's called a binary relation, which is a fancy way of defining some relationship between every pair in a set. When dealing with sorting in JavaScript though, we already get rule 1 and 4 for free as long as you always return _anything_ from your comparator. But rules 2 and 3 can potentially be violated.

As we saw in the example above we can violate the _antisymmetric_ rule by only checking one value before returning.

Violating the _transitive_ rule is a little harder but can happen under rare circumstances. Consider for example trying to sort which of Rock, Paper, Scissors is the "best" move to play. You might try to do this by comparing values directly in terms of which one beats others:

```javascript
const sortByWinner = (a, b) => {
	// If a beats b, then a should go first
	if (a.beats(b)) return -1;
	// If b beats a, then b should go first
	if (b.beats(a)) return 1;
	// Neither beats the other, so these two are equal
	return 0;
};
```

Although there is no obvious mistake in this code, it nonetheless will result in inconsistent ordering. Unfortunately, there is no way to fix this. Fundamentally the property we are trying to sort by is _intransitive_ and this is not so much a mistake in the code, as it is in the underlying assumptions we make in trying to sort by this property at all. It simply is not a property we can use to sort.

## How to get it right

We've seen how the example above got it wrong by treating `a` preferentially, but how would we do this correctly? It's quite a fiddly thing to do right, since either `a` or `b` might not have a name, so we need to elegantly handle comparison by string only if they both have a name. If either doesn't have a name, then we need to be careful to consider both `a` and `b` and compare them based simply on whether they have a name or not.

```javascript
// Sort users by name, but nameless users should go at the end
users.sort((a, b) => {
	// Both users have a name, so compare directly
	if (a.name && b.name) return a.name.localeCompare(b.name);

	// Otherwise we sort by having a name or not
	return !!b.name - !!a.name;
	// b goes first because we want names first, non-names second
});
```

Notice how in this revised version we now treat `a` and `b` equally. Anything we do to one we do to the other.

In general, to consistently write correct comparators we should try to follow these general rules:

- Always treat `a` and `b` equally
- Use subtraction for numbers
- Use `localeCompare` for strings
- Check that it is OK to modify the array before sorting
- In rare cases, a property is logically incompatible with the concept of ordering

Take care,

Rupert
