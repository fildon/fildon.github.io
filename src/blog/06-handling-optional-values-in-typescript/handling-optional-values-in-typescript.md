---
title: Handling Optional Values in TypeScript
description: What are all these question marks in my code?
date: 2021-07-10
layout: layouts/post.njk
---
Key takeaways:

- Prefer `??` to `||`
- Prefer `foo?.bar` to `foo && foo.bar`

In this post, we'll dive into three separate but similar syntaxes related to values that might not be defined:

- Optional Properties (?:)
- Nullish Coalescing Operator (??)
- Optional Chaining (?.)

## Optional Properties (?:)

[TypeScript Docs: Optional Properties](https://www.typescriptlang.org/docs/handbook/2/objects.html#optional-properties)

TypeScript supports optional properties via the following syntax:

```ts
// Works with 'interface'
interface User {
  name: string;
  age?: number;
}

// and also with 'type'
type User = {
  name: string;
  age?: number;
};
```

This defines a `User`, having a `name` and `age`. But whereas `name` is required, `age` is optional:

```ts
// Ash Ketchum is ten years old
const ash: User = { name: "Ash Ketchum", age: 10 };
// But Rupert doesn't want to tell you his age and that's OK
const rupert: User = { name: "Rupert McKay" };
```

When defining a function that accepts the `User` type, the `age` type will be `number | undefined`:

```ts
// Lets find out if this user is old enough to drive
function isOldEnoughToDrive(user: User) {
  // initially user.age is number | undefined
  if (user.age === undefined) {
    // But after an if check the type will be narrowed
    // In this example we return 'false' if 'age' isn't available.
    return false;
  }
  // But if age is available, then it is narrowed to a 'number' type.
  return user.age >= DRIVING_AGE;
}

isOldEnoughToDrive({ name: "Ash Ketchum", age: 10 }); // returns false
isOldEnoughToDrive({ name: "Rupert McKay" }); // returns false
isOldEnoughToDrive({ name: "Bilbo Baggins", age: 111 }); // returns true
```

This behavior is _nearly_ equivalent to if we had:

```ts
interface User {
  name: string;
  age: number | undefined;
}
```

The difference is whether the key must be explicitly provided by objects wanting to satisfy this interface:

```ts
interface User {
  name: string;
  age: number | undefined;
}

// Type error! "age" is a required property of "User"
const rupert: User = { name: "Rupert McKay" };

// This works... but I really don't like seeing explicit "undefined"
const rupert: User = { name: "Rupert McKay", age: undefined };
```

The Optional Property syntax defines properties we can omit. Whatever type we provide will default to `undefined` if the key is omitted.

## Nullish Coalescing Operator (??)

[MDN: Nullish coalescing operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator)

The `Nullish Coalescing Operator` provides a default value in case our original value is undefined or null.

```ts
const postTitle = post.title ?? "Rupert's blog post";
```

This will look familiar to JavaScript programmers who are used to using the OR operator (`||`) to provide default values. And most of the time it works the same.

The only difference is that `||` will fall back if the lefthand value is _anything_ falsey. Whereas `??` will only fall back if the lefthand value is `null` or `undefined`. _Often_ this works out the same, but there are some common gotchas, for example, what if our lefthand value is zero or the empty string? Perhaps I wanted to post a blog that has an intentionally blank title? If I were using `||` this would be impossible. Whereas with `??`, we can still provide an empty string value, while correctly using a default value in case of `undefined`.

I highly recommend forgetting about `||` for default fallbacks and using `??` instead.

You can enforce this with [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)'s own [prefer-nullish-coalescing](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/prefer-nullish-coalescing.md) rule

## Optional Chaining (?.)

[MDN: Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)

What if this time we have a `Session` object, which has a `User` only if the current visitor is logged in:

```ts
interface Session {
  user?: User;
}

function getWelcomeMessage(session: Session) {
  const userName = session.user?.name;
  if (userName === undefined) {
    return "Hello Guest!";
  }
  return `Hello ${userName}!`;
}
```

This is effectively a shorthand for:

```ts
const userName = user && user.name;
```

There is one small difference though, in that the `&&` style means our `userName` type will be possibly any falsey value that `user` could return. Whereas by using `?.` we can express our intent more concisely, and when the value is not available the whole expression fallbacks to `undefined`.

## All together

We can use all these concepts together:

```ts
interface Session {
  user?: User;
}

function getWelcomeMessage(session: Session) {
  const userName = session.user?.name ?? "GUEST";
  return `Hello ${userName}!`;
}
```

This is the same as the previous `getWelcomeMessage` but even more concise.

## Summary

- Prefer `??` to `||`
- Prefer `foo?.bar` to `foo && foo.bar`

Take care,

Rupert
