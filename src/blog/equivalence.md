---
title: Loose Equality violates Transitivity
description: Why does JavaScript get equality wrong and how could it be different?
date: 2023-03-09
layout: layouts/post.njk
---

In JavaScript:

```js
"0" == 0; // true
0 == []; // true
"0" == []; // false
```

These three statements demonstrate that loose equality in JavaScript is not _transitive_ and therefore is not a valid _equivalence relation_.

Despite this, the above is not a bug. It conforms exactly to [ECMAScript: IsLooselyEqual](https://262.ecma-international.org/#sec-islooselyequal).

## Equivalence Relations

An [Equivalence Relation](https://en.wikipedia.org/wiki/Equivalence_relation) is the mathematically formal term for what we intuitively understand as "equals". In order for a relation to be a valid `Equivalence Relation`, it must satisfy the following three properties:

- [Reflexivity](https://en.wikipedia.org/wiki/Reflexive_relation): `a == a`.
- [Symmetry](https://en.wikipedia.org/wiki/Symmetric_relation): "If `a == b` then `b == a`".
- [Transitivity](https://en.wikipedia.org/wiki/Transitive_relation): "If `a == b` and `b == c`, then `a == c`.

By the way, `NaN == NaN; // false` violates reflexivity. But there are reasons for that decision, which I will not get into in this post. If you are especially interested, I recommend: [Wikipedia | Comparison with NaN](https://en.wikipedia.org/wiki/NaN#Comparison_with_NaN)

## The Easy Fix

The easiest way to alter loose equality (`==`) to fix transitivity would be to treat all cross-type comparisons as false. This is exactly what the strict equality (`===`) operator in JavaScript does. Reference: [ECMAScript: IsStrictlyEqual](https://262.ecma-international.org/#sec-isstrictlyequal)

But that's boring. Let's entertain the question: are there ways we can preserve at least cross-type equalities, while also preserving transitivity?

## The Pitfalls

As soon as we allow even one equality across types we create a cross-type equivalence class.

An `Equivalence Class` is the set of all elements which are equivalent to one another.

Once you have a cross-type equivalence class, you have to be very careful when considering new members of that class. It is not sufficient to check our intuition against just one member of the equivalence class, since equivalence with any member, implies equivalence to all members (via transitivity).

The above implies two statements:

- Distinct values of the same type _must never be members of the same equivalence class_.
- A maximal equivalence class has exactly one value from each type.

## A Silly Proposal

Given the boolean type has only two values, there can exist only two distinct equivalence classes including booleans. We can use this as the basis for a set of maximal equivalence classes.

The `false` equivalence class:

- String: `''`
- Number: `0`
- BigInt: `BigInt(0)`
- Boolean: `false`
- Undefined: `undefined`
- Symbol: `Symbol.for('')`
- Null: `null`

The `true` equivalence class:

- String: `'true'`
- Number: `1`
- BigInt: `BigInt(1)`
- Boolean: `true`
- Symbol: `Symbol.for('true')`

The `false` class includes seven values, exactly one value from each primitive type.

The `true` class has five values. The only missing types are `undefined` and `null`, which cannot be included without merging the two equivalence classes. I _really_ don't like the use of `'true'` as the canonically true string, but this is what we get for pushing an idea to its limit.

In reality prohibiting cross-type equality is a perfectly sensible decision and very easy to reason about. It's no wonder that `===` is greatly preferred to `==`.

Take care,

Rupert
