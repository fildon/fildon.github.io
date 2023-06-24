---
title: Counting the Hard Way
description: A dive into esoteric base number systems
date: 2023-06-25
layout: layouts/post.njk
---

In this post we'll explore the weird world of alternative base number systems.

Let's start by counting to ten:

`0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...`

Congratulations.

But let's look at that sequence of symbols above. Isn't it weird that for most of the numbers I used just a single symbol, but for the last one I used two symbols (`1` and `0`)?

In base 10 we have 10 distinct symbols from 0-9, but we have to break out into multiple symbols for numeric values larger than 9. Let's hold that thought and move onto a different base number system.

## Binary Base 2

Binary is a numeral system using just the digits `0` and `1`. It is used extensively in computing and digital technology.

In binary, counting to ten looks like this:

`0, 1, 10, 11, 100, 101, 110, 111, 1000, 1001, 1010, ...`

## General Rules of Positional Notation Systems

Now that we've seen two examples, lets consider the general properties of Positional Notation Systems.

When we read a number like `423`. We interpret this as three separate values added together:

- `4 * 100`
- `2 * 10`
- `3 * 1`

We could also write this as:

- `4 * 10^2`
- `2 * 10^1`
- `3 * 10^0`

We do almost exactly the same in binary. Consider `1011`:

- `1 * 8 = 1 * 2^3`
- `0 * 4 = 0 * 2^2`
- `1 * 2 = 1 * 2^1`
- `1 * 1 = 1 * 2^0`

In both cases the individual digit values are multiplied by some power of the base value.

With this understanding it should be possible to understand how any _integer greater than 1_ can be used as a base, and what counting in such a system would look like.

But now that we know the rules... what if we start to break them?

First up: what if the base was negative?

## Negabinary Base -2

Suppose we have a base of -2. The powers of -2 are:

- `-2^5 = -32`
- `-2^4 = 16`
- `-2^3 = -8`
- `-2^2 = 4`
- `-2^1 = -2`
- `-2^0 = 1`

So how can we use this to count to ten?

The first two numbers are easy: `0, 1`. But already the next number presents a problem. Using just the powers available to us above how can we represent two?

The trick here is to notice that we can use:

- `-2^2 = 4`
- `-2^1 = -2`

i.e. `110` is two in Negabinary.

We make three by simply adding one to two.

i.e. `111` is three in Negabinary.

Then the whole sequence to ten is:

`0, 1, 110, 111, 100, 101, 11010, 11011, 11000, 11001, 11110, ...`

But what if we now also decide to count down?

Counting negatively:

`0, 11, 10, 1101, 1100, 1111, 1110, 1001, 1000, 1011, 1010, ...`

Notice an interesting property here:

- All the positive values have an odd number of digits
- All the negative values have an even number of digits

At no point did we need a minus sign to represent negative values!

We can intuitively understand this interesting property by recognising that the minus symbol has become redundant since it is "prebaked" into the base itself. Our "menu" of powers of -2 offers us both negative and positive values to choose from.

But we aren't done yet! What if our base was a complex number?

## Quarter-Imaginary Base 2i

The Quarter-Imaginary numeral system was first proposed by Donald Knuth in 1960. The trick with this base is recognising that powers of `2i` "rotate" through the Gaussian plane.

Powers:

- `-1: -(1/2)i`
- `0: 1`
- `1: 2i`
- `2: -4`
- `3: -8i`
- `4: 16`
- `5: 32i`
- `6: -64`
- `7: -128i`
- `8: 256`
- `9: 512i`

With this base we need four symbols: `0`, `1`, `2` and `3` to represent all values.

Positive real integers:

`0, 1, 2, 3, 10300, 10301, 10302, 10303, 10200, 10201, 10202, ...`

Negative real integers:

`0, 103, 102, 101, 100, 203, 202, 201, 200, 303, 302, ...`

Positive imaginaries:

`0, 10.2, 10, 20.2, 20, 30.2, 30, 103000.2, 103000, 103010.2, 103010, ...`

Negative imaginaries:

`0, 0.2, 1030, 1030.2, 1020, 1020.2, 1010, 1010.2, 1000, 1000.2, 2030, ...`

Some other examples:

- `1+i = 11.2`
- `-1+i = 113.2`
- `-1-i = 103.2`
- `1-i = 1.2`

In this way we can represent all complex numbers without needing a minus sign, nor a sign for `i`.

As before you'll notice that the modulo of the length of a number tells us something about where on the Gaussian plane our value is. Another interesting feature is the use of `0.2` to give us `-i`.

That's all for today.

Take care,

Rupert
