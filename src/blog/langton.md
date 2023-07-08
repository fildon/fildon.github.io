---
title: Langton's Ant and Unanswerable Questions
description: How even the simplest systems present impossible questions
date: 2022-11-21
layout: layouts/post.njk
---

[Langton's Ant](https://en.wikipedia.org/wiki/Langton%27s_ant) is a [cellular automaton](https://en.wikipedia.org/wiki/Cellular_automaton) first described by [Christopher Gale Langton](https://en.wikipedia.org/wiki/Christopher_Langton) in 1986. It looks like this:

<img src="../../static/LangtonsAntAnimated.gif" alt="Animation of first 200 steps of Langton's ant" />

The "Ant" exists on an infinite grid. Each cell of the grid can be either white or black, but initially all are white. Each "generation" the Ant moves according to the following rules:

- Turn left if the current cell is white, else turn right
- Change the colour of the current cell
- Step forwards

If we allow the ant to run for some time, it initially produces some very beautiful symmetries. For example:

Generation 96 displays an "S"-like pattern:

<a href="https://rupertmckay.com/langton/?generation=96"><img src="../../static/langton96.png" alt="Langton's Ant at generation 96" /></a>

Generation 184 looks like a pokeball about to open:

<a href="https://rupertmckay.com/langton/?generation=184"><img src="../../static/langton184.png" alt="Langton's Ant at generation 184" /></a>

Generation 368 is like a four tentacled monster:

<a href="https://rupertmckay.com/langton/?generation=368"><img src="../../static/langton368.png" alt="Langton's Ant at generation 368" /></a>

But then it produces chaotic patterns for many thousands of steps.

We might have guessed that this chaos would proceed forever. But then at around 10,000 steps, something magical emerges:

<a href="https://rupertmckay.com/langton/?generation=10500"><img src="../../static/langton10500.png" alt="Langton's Ant at generation 10500" /></a>

The Ant has begun to build a structure known as the highway. The highway is an infinitely repeating pattern. It takes the ant 104 steps for each iteration of the highway, and each iteration extends the pattern along a diagonal trajectory.

But we can change things. Instead of starting with a blank grid, we could set some cells to black at the begginning. If we then run the Ant it will generate different patterns. When people try this, they find that the highway _always seems to emerge sooner or later_. It is widely believed that the highway is inevitable, and yet this conjecture has never been proven nor disproven, despite many years of effort.

Such a simple system to define, and yet we are unable to answer the question "Does the highway always appear, no matter the starting state?"

## Rice's Theorem

[Henry Gordon Rice](https://en.wikipedia.org/wiki/Henry_Gordon_Rice) proved the following theorem in 1951:

> All non-trivial semantic properties of programs are undecidable.

A _trivial_ property of a program is one which is either always true or always false for every possible program.

_Semantic_ properties are about the behaviour of the program, rather than _syntactic_ properties which are about the source code.

A property is _undecidable_ if it is not possible for there to exist an algorithm which correctly identifies the property for all possible inputs.

A famous example of such a non-trivial semantic property is: "Does this program halt?". We know from the [Halting Problem](https://en.wikipedia.org/wiki/Halting_problem) that there can never exist a systematic way to identify whether any program halts or not.

Once again, we find that such a simple question cannot be answered.

## Rationalism and Empiricism

_Rationalism_ and _Empiricism_ are two different philosophical stances on how best to pursue knowledge.

- A _Rationalist_ believes that _reason_ is the primary way to gain knowledge. Truth is found by reasoning from first principles.
- An _Empiricist_ believes that _experience_ is the primary way to gain knowledge. Truth is found from direct observation and experimentation.

Neither view is always correct. Different fields of knowledge lend themselves more to rationalism while others to empiricism. Mathematics for example is exceedingly rational, whereas Biology is exceedingly empirical.

Computer Science is founded upon Mathematics, with the aim to _reason_ about computation and in so doing to derive concrete proofs. And yet examples like Langton's Ant and Rice's Theorem demonstrate that even very simple problems can elude solution.

There is a tension between Computer Science as an academic pursuit vs Software Engineering as a professional discipline. At heart, I am a rationalist. I crave proof and certainty. But I am employed as a professional. When trying to find truth in any matter, think critically about what is provable from reason and what is not. For the unprovables, be humble and open minded. Observe, experiment and adapt to your circumstances.

Take care,

Rupert
