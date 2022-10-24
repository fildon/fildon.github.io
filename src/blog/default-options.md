---
title: Default Options Pattern in TypeScript
description: I convenient pattern for
date: 2022-10-24
layout: layouts/post.njk
---

Here's a pattern I find myself reusing in a lot of projects:

```ts
type FormatOptions = {
  color: string;
  fontWeight: string;
};

const format = (
  message: string,
  { color = "black", fontWeight = "medium" }: Partial<FormatOptions> = {}
) => {
  // Implementation skipped
};
```

## Explanation

Imagine you have a function which can display some text formatted in a particular colour:

```ts
const format = (message: string, color: string) => {
  // implementation not important for this blog post
};

format("My message", "red"); // Format the text to be displayed in red
```

But most of the time you don't want to have to specify a color, so it would be nice if the color argument were optional:

```ts
const format = (message: string, color = "black") => {
  //
};

format("My red message", "red"); // A red message
format("My black message"); // A message using a sensible default color
```

But now suppose I also want to support a font-weight option. We could provide two optional arguments, one after the other:

```ts
const format = (message: string, color = "black", fontWeight = "medium") => {
  //
};

format("My medium black message"); // This works nicely!

// 🚨 I wanted bold fontWeight... but this is going to be treated as a color 🚨
format("O no this won't work", "bold");
```

The problem is that we want a way to make `color` and `fontWeight` both optional, but if they are just optional parameters, then order matters. So we have to pick one to go before the other, and then we lose the ability to specify a later optional argument without also specifying an earlier one.

Instead we should wrap them up in an options object:

```ts
const format = (
  message: string,
  {
    color = "black",
    fontWeight = "medium",
  }: { color?: string; fontWeight?: string }
) => {
  //
};

format("default formatted message", {}); // This works!
format("A red message", { color: "red" }); // Also works!
format("A bold message", { fontWeight: "bold" }); // This works too!
```

This is a perfectly good point to stop... however I don't entirely love having to pass an empty object in the case where we want all the defaults. What if instead the whole options object were itself optional?

```ts
const format = (
  message: string,
  {
    color = "black",
    fontWeight = "medium",
  }: { color?: string; fontWeight?: string } = {}
) => {
  //
};

format("A plain default message"); // Now this is fine too!
format("Formatting still works too", { color: "blue", fontWeight: "light" });
```

Perfect! We get support for sensible defaults, while also allowing users to provide specific options only for the bits they care about.

The only thing I might do in this position is pull out the type of the options object for clarity:

```ts
type FormatOptions = {
  color: string;
  fontWeight: string;
};

const format = (
  message: string,
  { color = "black", fontWeight = "medium" }: Partial<FormatOptions> = {}
) => {
  // Implementation skipped
};
```

Which brings us to where we started 😀

That's all for today

Take care,

Rupert
