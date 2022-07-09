---
title: TypeScript 4.4 - useUnknownInCatchVariables.
description: any vs unknown in catch blocks.
date: 2021-08-30
layout: layouts/post.njk
---
Key takeaways:

- The `unknown` type allows nothing. The `any` type allows everything
- JavaScript allows throwing any expression
- `useUnknownInCatchVariables` treats caught errors as `unknown`

Last week I updated our main repository at work to use TypeScript version 4.4.2.

You can see a rundown of the new features in TypeScript 4.4 on the Microsoft blog: [Announcing TypeScript 4.4](https://devblogs.microsoft.com/typescript/announcing-typescript-4-4/)

For our repository, 99% of it just worked without any changes required.

But unfortunately, we got stung by exactly one new feature during this upgrade:

- `useUnknownInCatchVariables`

This is a new tsconfig flag that is implicitly treated as true under strict mode.

This new flag changes the inferred type of caught errors from `any` to `unknown`. You can see more about this flag in [the TypeScript docs](https://www.typescriptlang.org/tsconfig#useUnknownInCatchVariables)

> `any` permits _any_ operation on it.
>
> `unknown` forbids _every_ operation on it.

When trying to rebuild our repository with v4.4 and no other changes, there were many compilation errors due to code like:

```ts
catch (error) {
  // O no! Not allowed to access "statusCode" on unknown
  if (error.statusCode === 404) {
    // redirect to 404 page
```

This works fine when `error` is `any` but with `unknown` we are not allowed to assume any keys exist, without first having a type check. So how hard would it be to add a type guard here? Maybe something like this would do the job:

```ts
// Define a custom typeguard:
const isErrorWithStatusCode = (error: any): error is { statusCode: number } => {
  return (
    typeof error === "object" &&
    error !== null &&
    typeof error.statusCode === "number"
  );
};
```

```ts
catch (error) {
  // Use the type guard
  if (isErrorWithStatusCode(error)) {
    // error is now narrowed to definitely have a statusCode
    if (error.statusCode === 404) {
      // redirect to 404 page
    }
    // Handle other status codes
  }
  // Handle errors that don't even have a status code
}
```

This works! Hooray. But this took a little while to implement and a little thought process to confirm it's all good to go. Unfortunately, when I was doing this I was staring at literally hundreds of these build failures, each one making different unconfirmed assumptions about what properties are available on the `error` value.

I could have gone through every instance of these issues and stopped and thought about sensible type guards, and how to handle guard failures... but then I would be doing nothing but that for the next 6 months.

Alternatively, I could have explicitly set the new flag to false... but then we would never benefit from this new feature (which I think is generally a good idea to have on!)

So instead in all cases where the build failed, I added a type annotation to `any` in the head of the catch block.

```ts
// Assume error is 'any' just like in TypeScript 4.3
catch (error: any) {
  if (error.statusCode === 404) {
    // redirect to 404 page
```

This is the same behavior as previously but just made explicit, rather than implicit. This way any new catch blocks added will have an inferred `unknown` type. We can still annotate this as `any` explicitly if we like, but the default will now be `unknown`.

If all this seems inconvenient... consider the fact that throwing a null ref from a catch block is very undesirable! And making as few assumptions as possible about our errors is key to avoiding that. `unknown` is by definition the type that assumes the least about the underlying value.

And finally just to really drive home how important this is... you might right now be thinking "but isn't an error always at least of type Error?". O, you poor lost soul. No, you have mistaken JavaScript for a sensible language.

No, in JavaScript throw expressions are allowed to throw literally any expression.

For example the following is valid:

```ts
const myThrowFunction = () => {
  try {
    throw undefined;
  } catch (error) {
    // "error" is literally the primitive value undefined

    // error.message here will throw a null ref
    // which will jump outside this catch block
    // rendering the try/catch here useless!
    // uncaught errors here we come!
    // not even try/catch can save you now!
    console.log(error.message);

    // see also error.stackTrace, error.name ... etc etc.
  }
};
```

So TypeScript should have always treated it as `unknown` because it really is! Literally, any expression can be thrown by JavaScript, so TypeScript ought to be very defensive. It's surprising this only got introduced in v4.4 and not earlier. But hey ho, here we are.

Reminder: Whenever TypeScript feels inconvenient, it's just because it's trying to stop you from shooting yourself in the foot. JavaScript is full of foot guns, but when you stop shooting yourself in the foot, TypeScript will be easy 😀
