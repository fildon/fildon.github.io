---
title: Accessing Unknown Objects in TypeScript
description: How to solve `Object is of type 'unknown'` errors.
date: 2022-09-11
layout: layouts/post.njk
---


There's a utility function I find myself adding to almost every TypeScript repo I work on.

It goes like this:

```ts
const isObject = (
  unknown: unknown
): unknown is Record<PropertyKey, unknown> =>
  typeof unknown === 'object' && unknown !== null
```

## Usecase in Error Handling

Occasionally we have to deal with `unknown` values. The most common example of this is in `catch` blocks. Often we want to assume that the caught error is some kind of native `Error` object, which would have a `message` property.

```ts
try {
  somethingDangerous()
} catch (error) {
  // `error` is of `unknown`
  console.log(error.message)
  // We get a type error on `error.message`
  // because `Object is of type 'unknown'`
}
```

> Since [TypeScript 4.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html#using-unknown-in-catch-variables) caught errors are `unknown` by default.

But by using our `isObject` utility, we can narrow the `error` to something which has keys or not:

```ts
try {
  somethingDangerous()
} catch (error) {
  console.log(
    isObject(error)
    ? error.message
    // 👆 safe access within this branch
    : error
    // In this case `error` is something different
    // So we'll just log it directly as is.
  )
}
```

## Usecase in Composing Type Predicates

Learning to create your own type predicates is an important skill in TypeScript. There's a lot you can do by hand, but I will very often use `isObject` as a starting point for more involved type predicates.

Here's a very simple example:

```ts
type UserApiResponse = {
  userName: string
}

const isUserApiResponse = (
  userResponse: unknown
): userResponse is UserApiResponse =>
  isObject(userResponse)
  && typeof userResponse.userName === 'string'
```

If we need to go any deeper than one level, this approach becomes very cumbersome; at which point I recommend reaching for a schema validation library such as [Zod](https://github.com/colinhacks/zod).

Here's how the same code above would look with Zod:

```ts
import { z } from 'zod'

const UserApiResponse = z.object({
  userName: z.string()
})

type UserApiResponse = z.infer<typeof UserApiResponse>

const isUserApiResponse = (
  userResponse: unknown
): UserResponse is UserApiResponse => 
  UserApiResponse.safeParse(userResponse).success
```

That's all for today.

Take care,

Rupert
