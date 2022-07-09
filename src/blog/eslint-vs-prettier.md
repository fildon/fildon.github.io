---
title: ESLint vs Prettier.
description: Why I don't use the 'fix' option.
date: 2021-10-09
layout: layouts/post.njk
---
TL;DR: `ESLint` should identify _semantic_ errors _which require programmer intervention to fix_, while `prettier` should identify _text formatting errors_ which do not require programmer intervention to fix.

## The problem with Static Analysis

So there's this guy "Rice" and he said, "We literally can't know anything interesting about any program" [Rice's theorem](https://en.wikipedia.org/wiki/Rice%27s_theorem). Well dang.

That's a really big problem since we really want to know _is this code any good?_

Rice's theorem doesn't completely prevent static analysis, but it does tell us that _literally every attempt at static analysis_ will be flawed in some way. This is a fundamental problem with computation, not `ESLint` or `Prettier` in particular.

So I really want everyone reading this to understand _automated tools will never be able to fix your code_.

But automated tools do still provide value.

## The Good News

Rice's Theorem makes a distinction between _syntatic_ and _semantic_ properties of programs. Roughly speaking _syntactic_ is "how it is written", whereas _semantic_ is "how it behaves".

Most syntactic problems can be trivially identified and fixed. The most well-known of these are things like indentation and linebreaks. These things do not affect the _behavior_ of the program, but do create a consistent _syntactic_ standard for programmers.

It's the _semantic_ properties that are the tricky ones.

## A Clear Separation

We as fleshy non-automated humans therefore should be very happy with anything that can automate _syntactic_ standards for us.

On the other hand, any automated tool intended to address _semantic_ problems should be treated with suspicion. That is not to say we shouldn't use such tools but Rice's Theorem tells us that automation will never find every problem and even for the problems it does finds _it will be wrong some of the time_. So as far as I'm concerned human participation is required in the resolution of every _semantic_ problem.

## The Past

It used to be that `ESLint` was the go-to tool for both _syntactic_ and _semantic_ problems. And in many codebases it still is. But with the rise of `Prettier`, more and more of the _syntactic_ stuff gets handled by `Prettier`. _I strongly feel that this is a useful separation of responsibilities_.

## The Weakness in my position

Every system is legacy. `ESLint` did not design their API with `Prettier` in mind. But they _did_ design their API with a very customizable plugin system in mind and included a 'fix' option that plugins could implement to provide automated corrections to problems. But as discussed above, I believe such automated fixes should only be permitted for _syntactic_ problems. I have taken the position that _syntactic_ problems should be the sole responsibility of `Prettier` to fix, but there certainly exist many `ESLint` plugins with 'fixable' rules which `Prettier` does not handle.

_I'm ok with that_.

The weakness of my position is that programmers might need to check more problems than strictly theoretically necessary. But I would much rather have that situation than the alternative.

## A Closing Thought

_If everyone swept leaves it would be easy to keep the gardens clean._

I think as tech nerds we all get very excited about being flashy and coming up with grand schemes to solve all our problems. But there is a quiet humility to faithfully carrying out even the tedious parts of our job. It is tempting to believe that the next piece of code we write will be the one that finally solves all our problems. Unfortunately, there will always be leaves falling on the grass. The sooner we accept that, the sooner we can stop being continually disappointed by automated tools. The best codebases I have seen, have been maintained by teams who don't try to show off but care deeply about every line of code. _If everyone swept leaves..._ The job is never done, but thankfully I enjoy it 😄

The only problem is I need everyone to enjoy sweeping leaves as much as I do.

In any case, I am confident that if I persuade only some small percentage of programmers I ever meet of this way of thinking, it will have more impact than any line of code I ever write.
