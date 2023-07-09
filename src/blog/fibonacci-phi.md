---
title: How Phi and Fibonacci are connected.
description: The Fibonacci sequence has an intrinsic relationship with Phi. Lets demonstrate it from first principles.
date: 2023-07-09
layout: layouts/post.njk
---

## Definition: Fibonacci Sequence

The [Fibonacci Sequence](https://en.wikipedia.org/wiki/Fibonacci_number) is a sequence starting, `0, 1, 1, 2, 3, 5, 8, 13...`, and each subsequent number is the sum of the previous two.

We can define the Fibonacci numbers recursively as:

<math display="block">
  <msub>
    <mi>F</mi>
    <mn>0</mn>
  </msub>
  <mo>=</mo>
  <mn>0</mn>
</math>

<math display="block">
  <msub>
    <mi>F</mi>
    <mn>1</mn>
  </msub>
  <mo>=</mo>
  <mn>1</mn>
</math>

<math display="block">
  <msub>
    <mi>F</mi>
    <mi>n</mi>
  </msub>
  <mo>=</mo>
  <msub>
    <mi>F</mi>
    <mrow>
      <mi>n</mi>
      <mo>-</mo>
      <mn>1</mn>
    </mrow>
  </msub>
  <mo>+</mo>
    <msub>
    <mi>F</mi>
    <mrow>
      <mi>n</mi>
      <mo>-</mo>
      <mn>2</mn>
    </mrow>
  </msub>
</math>

## Definition: Phi

Phi is the "Golden Ratio". Two quantities
<math><mi>a</mi></math>
and
<math><mi>b</mi></math>
are in the _golden ratio_
<math><mi>φ</mi></math>
if:

<math display="block">
  <mfrac>
    <mrow>
      <mi>a</mi>
      <mo>+</mo>
      <mi>b</mi>
    </mrow>
    <mi>a</mi>
  </mfrac>
  <mo>=</mo>
  <mfrac>
    <mi>a</mi>
    <mi>b</mi>
  </mfrac>
  <mo>=</mo>
  <mi>φ</mi>
</math>

Given this definition, we can derive the following additional relationships:

<math display="block">
  <mn>1</mn>
  <mo>+</mo>
  <mfrac>
    <mn>1</mn>
    <mi>φ</mi>
  </mfrac>
  <mo>=</mo>
  <mi>φ</mi>
</math>

<math display="block">
  <msup>
    <mi>φ</mi>
    <mn>2</mn>
  </msup>
  <mo>=</mo>
  <mi>φ</mi>
  <mo>+</mo>
  <mn>1</mn>
</math>

## Connecting the two together

The values of the Fibonacci sequence increase in size very quickly. But how fast exactly?

Lets assume it can be approximated by some exponential curve of the form:

<math display="block">
  <msub>
    <mi>F</mi>
    <mi>n</mn>
  </msub>
  <mo>=</mo>
  <msup>
    <mi>x</mi>
    <mi>n</mi>
  </msup>
</math>

Where <math><mi>x</mi></math> is some constant.

If so, then from the recursive definition of the Fibonacci numbers:

<math display="block">
  <msub>
    <mi>F</mi>
    <mi>n</mn>
  </msub>
  <mo>=</mo>
  <msup>
    <mi>x</mi>
    <mi>n</mi>
  </msup>
  <mo>=</mo>
  <msub>
    <mi>F</mi>
    <mrow>
      <mi>n</mi>
      <mo>-</mo>
      <mn>1</mn>
    </mrow>
  </msub>
  <mo>+</mo>
    <msub>
    <mi>F</mi>
    <mrow>
      <mi>n</mn>
      <mo>-</mo>
      <mn>2</mn>
    </mrow>
  </msub>
  <mo>=</mo>
  <msup>
    <mi>x</mi>
    <mrow>
      <mi>n</mi>
      <mo>-</mo>
      <mn>1</mn>
    </mrow>
  </msup>
  <mo>+</mo>
  <msup>
    <mi>x</mi>
    <mrow>
      <mi>n</mi>
      <mo>-</mo>
      <mn>2</mn>
    </mrow>
  </msup>
</math>

<math display="block">
  <msup>
    <mi>x</mi>
    <mi>n</mi>
  </msup>
  <mo>=</mo>
  <msup>
    <mi>x</mi>
    <mrow>
      <mi>n</mi>
      <mo>-</mo>
      <mn>1</mn>
    </mrow>
  </msup>
  <mo>+</mo>
  <msup>
    <mi>x</mi>
    <mrow>
      <mi>n</mi>
      <mo>-</mo>
      <mn>2</mn>
    </mrow>
  </msup>
</math>

And if we divide through by:
<math display="block">
<msup>
<mi>x</mi>
<mrow>
<mi>n</mi>
<mo>-</mo>
<mn>2</mn>
</mrow>
</msup>
</math>

Then we get:

<math display="block">
  <msup>
    <mi>x</mi>
    <mn>2</mn>
  </msup>
  <mo>=</mo>
  <mi>x</mi>
  <mo>+</mo>
  <mn>1</mn>
</math>

This last relationship is _exactly_ the relationship we identified earlier in the definition of φ. And so we can conclude:
<math display="block">
<mi>x</mi>
<mo>=</mo>
<mi>φ</mi>
</math>

But wait! We aren't done. This conclusion was predicated on a very shaky assumption "lets assume the Fibonacci sequence can be approximated by some exponential curve".

Despite this assumption we can conclude rigorously that _if_ any consecutive pair of Fibonacci numbers were exactly in the Golden Ratio, then all subsequent pairs would also be.

So we've identified that the Golden Ratio is "stable" with respect to the recursive property of Fibonacci numbers.

But that's not useful if we never happen to hit the Golden Ratio in the course of the Fibonacci pairs.

Lets consider what happens when the current ratio is not <math><mi>φ</mi></math>.
Lets model it as having a ratio of
<math>
<mi>φ</mi>
<mo>+</mo>
<mi>δ</mi>
</math>, for some non-zero <math><mi>δ</mi></math>.

Then the next ratio will be:

<math display="block">
  <mfrac>
    <mrow>
      <mn>1</mn>
      <mo>+</mo>
      <mi>φ</mi>
      <mo>+</mo>
      <mi>δ</mi>
    </mrow>
    <mrow>
      <mi>φ</mi>
      <mo>+</mo>
      <mi>δ</mi>
    </mrow>
  </mfrac>
  <mo>=</mo>
  <mfrac>
    <mn>1</mn>
    <mrow>
      <mi>φ</mi>
      <mo>+</mo>
      <mi>δ</mi>
    </mrow>
  </mfrac>
  <mo>+</mo>
  <mn>1</mn>
</math>

This last term is similar to
<math>
<mn>1</mn>
<mo>+</mo>
<mfrac>
<mn>1</mn>
<mi>φ</mi>
</mfrac>
<mo>=</mo>
<mi>φ</mi>
</math>
but with the added <math><mi>δ</mi></math> term.
As such if <math><mi>δ</mi><mo>></mo><mn>0</mn></math>,
then our first ratio was greater than <math><mi>φ</mi></math>,
but our second ratio will be less than <math><mi>φ</mi></math>.

On the other hand if <math><mi>δ</mi><mo><</mo><mn>0</mn></math>,
then our first ratio was less than <math><mi>φ</mi></math>,
but our second ratio will be greater than <math><mi>φ</mi></math>.

From this we can conclude that ratios of Fibonacci pairs will "oscillate" either side of <math><mi>φ</mi></math>. But you may also note that because of the position of the <math><mi>δ</mi></math> term in the denominator the absolute distance from <math><mi>φ</mi></math> reduces from every ratio to the next.

We have therefore concluded two things:

- Fibonacci pair ratios will "oscillate" either side of <math><mi>φ</mi></math>.
- Fibonacci pair ratios will converge on <math><mi>φ</mi></math>.

Notice also that these two conclusions did not depend on the starting values chosen for the Fibonacci sequence. They follow solely from the recursive property of the Fibonacci numbers and the definition of <math><mi>φ</mi></math>. As such these conclusions would still hold no matter what starting values are chosen.

Take care,

Rupert
