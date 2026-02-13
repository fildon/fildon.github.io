---
title: What is memoization?
description: Learn when and how to use memoization to optimize performance by caching expensive computation results for reuse.
date: 2022-02-28
layout: layouts/post.njk
---

Imagine I asked you to calculate 23 times 47. And let's imagine you don't have a calculator or your phone on you, so you have to do it the hard way using just a pencil and paper. Your working might look something like this:

> 23 \* 47
>
> = 20 \* 47 + 3 \* 47
>
> = 940 + 120 + 21
>
> = 1081

Great! You worked it out. But it wasn't fun and it wasn't easy. So if later I ask you again "What is 23 times 47?", you really don't want to have to do that calculation again. Fortunately, you still have the answer written down from last time, so you can just look at the bottom of the paper and say "1081" triumphantly.

_That is memoization_.

> Memoization is the process of "remembering" the results of previous computations, which can be reused in the future.

## What shouldn't be memoized?

Unfortunately, not every kind of computation is suitable for memoization.

> Very cheap functions

Imagine I ask you "What's 1+1?", you can answer "2" immediately. And when I ask you again later, it wouldn't be any faster to try and remember what you did last time... it's quicker just to recompute the answer from scratch since you can do it instantly anyway.

> Non-deterministic functions

Imagine your friend asks you to think of a random number from 1 to 10. They probably _don't want you to_ give the same answer every time.

> Side-effects

If a function has any side effects. Your friend now asks you to clean the dishes, and you do so. If the next day they ask you to do it again, it's tempting, but not helpful to say that you did it yesterday. It doesn't matter that you did it previously, _you have to do it again_.

> Time-dependent

If a function depends on time in some way. Your friend asks you what time it is. If an hour later they ask again, it would be wrong to repeat the answer you gave last time.

- 1+1 doesn't need to be memoized
- Random results shouldn't be memoized
- Side effects shouldn't be memoized
- Time-dependent shouldn't be memoized

Once you've ruled out all of those, you are left with _pure functions_. By definition, pure functions depend only on their inputs and for a given input, always return the same answer. Pure functions have lots of interesting and useful properties, but today we'll just be talking about memoization.

## Pseudocode

> Receive input
>
> Check if we have seen this input before
>
> If we have: return the result
>
> If we haven't: compute the result, store it along with the input. Return the result.

## A First Attempt

```ts
const memoize = <Input extends PropertyKey, Result>(
	callback: (input: Input) => Result,
) => {
	// 'memory' will store previous results
	const memory: Map<Input, Result> = new Map();

	// Return the newly memoized function
	return (input: Input) => {
		// If we haven't already seen this 'input'
		if (!memory.has(input)) {
			// Then call the "real" function and store the result in memory
			memory.set(input, callback(input));
		}

		// Return the result from memory
		return memory.get(input)!;
	};
};
```

[Try this code out in TypeScript Playground](https://www.typescriptlang.org/play?#code/MYewdgzgLgBAtgUziAlgLwTAvDAPASTAAcBXWBADygTABMIYAFAJxCIWagE8BpBLgDQwASgggkANlAB8ACgBQMGMACGEiQCMVwANYAuGLJTEyBwqSgBKbNJFjJUeday2A3opgB6TzADkiZGYuXxgAdxR1GGgQZkwiWIA3FBASBljxKQgPUEhYAJiuAwBZFSICEyghUQyZbBgwBFCYEqJZSwBueQ9vOygSZjAYKAALTAbQiS54JFQMWhgAMxIwYChksA9YvoHDYwszCuc3DyUe-AWwzGGVBJpfWDVYlVopiAQaIeGUBl89sl8TjAUBdZABCfJBAB01wgRkO1ncSiRXh8ABVRoNVJERpgAERPCS4xbLVbrGAqOhRKAxTA4mDpBxAwYQriApQsyFvKBwixCLGabQ6HlkSwdQEAXy6yJ6om2gzpDKki1YcGmgVZyK2-WZMyhAHMENy-lZQZ0lOLOhb5EA)

The limitation here is that we can only use this on functions that take a single argument (`Input`) and that single argument must be something we can use as a key (`extends PropertyKey`).

## A better way

If instead, we want to be able to support all kinds of functions, then our memoizer also needs to be provided a way to _resolve_ a given argument list to a property key. We call this a `resolver`.

```ts
const memoize = <Args extends any[], Result>(
	callback: (...args: Args) => Result,
	resolver: (...args: Args) => PropertyKey,
) => {
	const memory: Map<PropertyKey, Result> = new Map();

	// Everything here is the same as above, except...
	return (...args: Args) => {
		// ... we invoke the resolver here to get the key we will use for this input
		const key = resolver(...args);

		if (!memory.has(key)) {
			memory.set(key, callback(...args));
		}

		// Return result from memory
		return memory.get(key)!;
	};
};
```

[Try this code out in TypeScript Playground](https://www.typescriptlang.org/play?#code/MYewdgzgLgBAtgUziAlgLwTAvDAPAQQCcBzCGBADygTABMyBDMATwG0BdAGhgCUEIArgBsoAPgAUAKBgxgDIUIBGDYAGsAXDHEA6XQxIRNRUgEpso3v2FRO0mIX4ghANwSFNOvQaMGzWCwAKhCAADm5QzADSCMySfhYA3nagkLCIyITMmgCyDCG4QaHhUTHcfIIiFjhgCADuMLkh4iYA3JJ2APQdMACirplQABYoYMQwg26YKGRDmBAMiDAMjIogrtyUwAghULradg5QAoRgWnv6pD6m5jBJMjJdMHswtVNgziCqmLP2ji5u40mMCgIBgxAQsB+X2YL0wtRQChgAggmAAZiBCMDhmQRiEBFA7DIUtAYNDsL8IE5+p5tBcIK12vcYChUVoAITpDHMbSDZbiaEmMx3JnwJBc7QoqD80qyeRKFSqGl0wVtJkAX0Z90efCOJwp1hgqOCcFFGViTMOx1OnMy2nBUoFbNVMDVbVdkiAA)

We can now apply this as a wrapper to any expensive pure function.

At this point, you might be interested to compare this implementation to the implementations offered by Lodash's [memoize](https://github.com/lodash/lodash/blob/4.17.15/lodash.js#L10540) and Ramda's [memoizeWith](https://github.com/ramda/ramda/blob/v0.28.0/source/memoizeWith.js#L36)

Both take the same approach of applying a resolver to get and set results to a key-value store. The only variations I see are that Lodash binds their storage as a property on the returned function, while Ramda [curry](https://en.wikipedia.org/wiki/Currying) the whole thing. But otherwise, the essence of all of these implementations are very similar.

## Recursive functions

While the above approach is perfect for conventional expensive pure functions, it is not all that useful for recursion. Let's consider the classic example of [Fibonacci numbers](https://en.wikipedia.org/wiki/Fibonacci_number):

```ts
let invocationCounter = 0;

/**
 * Compute the nth fibonacci number
 */
const fibonacci = (n: number): number => {
	invocationCounter++;
	if (n <= 1) return 1;
	return fibonacci(n - 1) + fibonacci(n - 2);
};

fibonacci(20);
console.log(invocationCounter); // 21891
```

It takes over 20 thousand invocations to compute just the 20th Fibonacci number!

But what if we pass this through our memoizer?

```ts
const memoFibonacci = memoize(fibonacci, (n) => n);
memoFibonacci(20);
console.log(invocationCounter); // 21891
```

[Try this in the TypeScript Playground](https://www.typescriptlang.org/play?#code/MYewdgzgLgBAtgUziAlgLwTAvDAPAQQCcBzCGBADygTABMyBDMATwG0BdAGhgCUEIArgBsoAPgAUAKBgxgDIUIBGDYAGsAXDHEA6XQxIRNRUgEpso3v2FRO0mIX4ghANwSFNOvQaMGzWCwAKhCAADm5QzADSCMySfhYA3nagkLCIyITMmgCyDCG4QaHhUTHcfIIiFjhgCADuMLkh4iYA3HYOUAKEYFq62vqkPqbmMEkyMinQMKox2PaOLm6e-b5t4zAoAGZaAITpIJnaABYMEOIzzCZm+4cQCFDnpbLySiqqywMQV2vjHV09N2Y2mI90elx2PwAvm1oZJJAB6eEwADqCAA5AoYAI7hswM4QHIoChwABhEACMDUQgwKAgGmEN4wI4gepwJjMGkoRBkTYoRTgFTAFAbMhyBQIWiSIT3XH4wnEsBkilUuYABjak1gvP5YEFwpw4jAmjAAjgijcJmNpvN1P8ozsKDxBIYRNJ5MpbgA1J6flstD1cDgAIxmP7dGBBn5hnragXAIWGmAAWgjZk9MFjuvjKETKYATK0ZJJYZJM3rxHnVa1JJMnAhtEIQMRxI65S6FUqPYRC4iYHmgwAOACcQbhmvgSBAADE+XGhXN9ugEOIy9nuD07WBq63na7Fe6VTh1ZJ9jOdeXK9Xa9KG02W075W7lRaWjBe-3h0HtDAAHJ0801LyUA7HCO6Pvuz62jAx6nrOWYJpeGrgBAda3s2YHtk+XY9kiqrfgAQgIsBikIjrEDAtQoFARw0kcmAQAwiC4iEREwAwMB3CktCckxtQHKoECSEAA)

It took _exactly the same amount of invocations_. We gained zero benefits from memoization!

The problem is that our memoizer only memoizes the top-level call to `fibonacci`. Since the underlying implementation still calls out to the original `fibonacci` implementation, those inner calls are not memoized. It will have correctly stored the result of `memoFibonacci(20)` in memory, so this particular result can be retrieved instantly if we ask it again. But if we change the input to `memoFibonacci(19)` we get no benefit _even though that result was computed as part of the recursive calculation previously_.

So ideally we want a way to memoize `fibonacci` such that every intermediate result gets memoized along the way, _not just the top-level call_.

## Memoizing Fibonacci

To more fully memoize `fibonacci` we have to insert the memoization inside the implementation. The approach here should look very familiar but done in a way that cannot be easily separated out.

```ts
let invocationCounter = 0;
const memory = new Map<number, number>();
const memoFibonacci = (n: number): number => {
	invocationCounter++;
	if (memory.has(n)) return memory.get(n)!;
	if (n <= 1) return 1;
	const result = memoFibonacci(n - 1) + memoFibonacci(n - 2);
	memory.set(n, result);
	return result;
};

memoFibonacci(20);
console.log(invocationCounter); // 39
```

[Try this in the TypeScript playground](https://www.typescriptlang.org/play?#code/DYUwLgBAlgdgbgewMYEMxQTAwggrjMEAJwgF4IAGAbgCglMBnSAWxGYSIE8yIYQB3CAFkUABwA8MXMwBGxADS9pcogD4AFAEo6jFmwQAxKDMwokSKD3UwAXEtnFNdqQ5KlVEAN40I0eMjQMbDwCYgBqMNpfKAAzCHVWdi4AOgALFAZrTU0IInBcIhgIRI5OZIBzcCyAQijoOOsIcXIARhy8sAKilrr6GCZckAZcYEhyEqMTGDMLRoBaCDaIMOL9SdNzKHmIACZNOpKUhiqYRTzh0f2fQc7CwYuwWgBfGhoJ4w3ZnYorvoYEUDJYAIcrqWCIVDoTA4fCEIj7CAAekREAAzABOGhAA)

This brought the invocations down to just 39. That's a huge performance win. If you are familiar with [O-notation](https://en.wikipedia.org/wiki/Big_O_notation), our initial implementation was `O(n^2)` whereas now it is just `O(n)`. But don't worry if you don't know what this means. It is just a fancy way of saying that it is a heck of a lot faster when properly memoized.

## Conclusion

- Memoization is suitable for computationally expensive pure functions
- Custom implementation is not so difficult, but many libraries also exist
- Recursive functions present an additional challenge, but the rewards can be huge

Take care,

Rupert
