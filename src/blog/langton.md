---
title: Langton's Ant and Unanswerable Questions
description: How even the simplest systems present impossible questions
date: 2022-11-21
layout: layouts/post.njk
---

[Langton's Ant](https://en.wikipedia.org/wiki/Langton%27s_ant) is a [cellular automaton](https://en.wikipedia.org/wiki/Cellular_automaton) first described by [Christopher Gale Langton](https://en.wikipedia.org/wiki/Christopher_Langton) in 1986. It looks like this:

<img src="../../static/LangtonsAntAnimated.gif" alt="Animation of first 200 steps of Langton's ant" />

The "ant" exists on an infinite grid. Each "step" it moves according to the following rules:

- Turn left if the current cell is white, else turn right
- Change the colour of the current cell
- Step forwards

If we allow the ant to run for some time, it initially produces some very beautiful symmetries.

TODO examples

But then it produces chaotic patterns for many thousands of steps.

TODO examples?

We might have guessed that this chaos would proceed forever. But then at around 10,000 steps, something magical emerges.

<img src="../../static/LangtonsAnt.png" alt="A repeating pattern emerges from a chaotic mess." />

This structure is called the highway. The highway is an infinitely repeating pattern. It takes the ant 104 steps for each iteration of the highway, and each iteration extends the pattern along a diagonal trajectory.

So far I have discussed Langton's Ant as though it were a system taking no inputs. It starts from an infinite blank grid and will proceed deterministically the same way every time we run it. But what happens if we permit an input to modify the initial state the ant starts from?

If we start the ant from a different state and run it for sufficiently long, the highway will seem to _always emerge sooner or later_. But can we prove that it will always emerge? Apparently not! The conjecture that the highway will always emerge for any possible starting state has never been proven nor disproven, despite many years of effort. And yet for every input ever tried, the highway has emerged.

## Rice's Theorem

[Henry Gordon Rice](https://en.wikipedia.org/wiki/Henry_Gordon_Rice) proved the following theorem in 1951:

> All non-trivial semantic properties of programs are undecidable.

A _trivial_ property of a program is one which is either always true or always false for every possible program.

_Semantic_ properties are about the behaviour of the program, rather than _syntactic_ properties which are about the source code.

A property is _undecidable_ if it is not possible for there to exist an algorithm which correctly identifies the property for all possible inputs.

Taken all together, we could reexpress the above as:

> For any non-trivial semantic property, we cannot create an algorithm which will always correctly identify the presence of that property.

A famous example of this is the [Halting Problem](https://en.wikipedia.org/wiki/Halting_problem). Whether a program halts or not is a non-trivial semantic property of that program. There cannot exist a program to solve the Halting Problem.

## Rationalism and Empiricism

_Rationalism_ and _Empiricism_ are two different philosophical stances on how best to pursue knowledge.

- A _Rationalist_ believes that _reason_ is the primary way to gain knowledge. Truth is found by reasoning from first principles.
- An _Empiricist_ believes that _experience_ is the primary way to gain knowledge. Truth is found from direct observation and experimentation.

Neither view is always correct. Different fields of knowledge lend themselves more to rationalism while others to empiricism. Mathematics for example is exceedingly rational, whereas Biology is exceedingly empirical.

Computer Science is founded upon Mathematics, with the aim to _reason_ about computation and in so doing to derive concrete proofs. And yet examples like Langton's Ant and Rice's Theorem demonstrate that even very simple problems can elude solution.

There is a tension between Computer Science as an academic pursuit vs Software Engineering as a professional discipline. At heart, I am a rationalist. I crave proof and certainty. But I am employed as a professional. When trying to find truth in any matter, think critically about what is provable from reason and what is not. For the unprovables, be humble and open minded. Observe, experiment and adapt to your circumstances.

Take care,

Rupert
