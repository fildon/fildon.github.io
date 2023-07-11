---
title: Asynchronous Programming in TypeScript.
description: async/await vs promises.
date: 2022-05-16
layout: layouts/post.njk
---

Key takeaways:

- Promises can run code _after some other code has completed_
- `async/await` is just syntactic sugar
- `Promise.all` is great for parallel tasks

## What is a Promise?

A promise is some task that we can use to chain together later tasks.

For example, imagine telling your friend how to make tea. Here's one way to do it:

> Say to your friend, "Boil water."
>
> _Stand next to them awkwardly, waiting for them to finish boiling water_
>
> Say to your friend, "Pour the hot water into a cup and add a teabag."

But it's usually easier to provide all the instructions right away, without having to wait:

> Say to your friend, "Boil water... _and then when you are done with that_ you should pour it into a cup and add a teabag".

With this second approach, we don't have to wait around watching our friend boil water and can go off and do something else. Sooner or later, our friend will complete the whole task and have a lovely cup of tea.

The key insight here is recognizing how we can give instructions that will only be executed _after some other instruction has been completed_. Promises are the mechanism by which we provide instructions to execute later.

In the language of promises, we could say that "boil water" is a function that returns a _Promise of boiled water_ and we chain on a `then` to do something with that boiled water when it is ready.

## Promise Syntax

Lets look at a more practical programming example. Imagine we have a website where users can 'favourite' products. We might store user information in a database, which can only be accessed _asynchronously_. To get a user's wishlisted products, we might have some code that looks like:

```ts
const getProductWishlistForUser = (userId: string): Promise<Array<Product>> =>
  fetchUser(userId).then((user) => user.wishlist);
```

`fetchUser` is some function that accesses our database. It might be rather slow, or perhaps need to run over a network request, so it can't return _synchronously_. Instead, it returns a _promise of a user_, or in TypeScript syntax, that would be `Promise<User>`. To do something with that `user` when the `Promise` is ready, we use `.then`. Every `Promise` resolves to some result eventually, and the `.then` method is how you indicate what you want to do with that result when it is ready. In this example, we are saying, "get the user _and then_ return just the wishlist on that user.

## Async/Await Syntax

The `async/await` syntax is a more recent addition to JavaScript. Here's that same example but rewritten using `async/await`:

```ts
const getProductWishlistForUser = async (
  userId: string
): Promise<Array<Product>> => {
  const user = await fetchUser(userId);
  return user.wishlist;
};
```

Some people find this syntax easier to read. The `await` keyword converts a `Promise` into its resolved type. In this case, turning `Promise<User>` into just `User`. We can then access the `User` object directly without needing to be inside a `.then` callback. But it is very important to understand that these two examples will be executed in _exactly the same way_. Notice how the return type of this function is still a `Promise`. Every `async` function is wrapped in a `Promise` automatically. This can be occasionally surprising and misleading. But if you understand that fundamentally `async/await` is just syntactic sugar for promises, then you won't be confused.

## Parallelism

A common mistake I see with `async/await` is waiting for promises to resolve one after the other, even when they could be running in parallel. Consider this example:

```ts
const getAllUsersAndProducts = async () => {
  const users = await fetchAllUsers();
  const products = await fetchAllProducts();

  return { users, products };
};
```

The problem here is that we fully wait for the user request to complete before even starting the product request. If I had to boil two pots of water, I wouldn't wait for one to begin boiling before starting the second one, I would start both at the same time. There isn't a direct way to do this with the `async/await` syntax, but we can achieve this with `Promise.all`:

```ts
const getAllUsersAndProducts = () => {
  return Promise.all([fetchAllUsers(), fetchAllProducts()]).then(
    ([users, products]) => ({ users, products })
  );
};
```

`Promise.all` takes an array of promises and returns a single combined promise. You can use this to start multiple asynchronous tasks at the same time, and then chain on a later task only when all the initial tasks have resolved.

In this case, we can expect the code to run roughly two times faster, because we are waiting for two things _running at the same time_ rather than having to wait for them to finish one after the other. The benefit of this approach is even more significant when handling three or more promises that can run in parallel.

So for situations like this, it seems the promise syntax is the better choice.

## Async/Await shared scope

Promises aren't always better than `async/await`, however. There's one thing that `async/await` can do, which promises can only do with great difficulty. Suppose that we have an `orderId` which we can use to look up order details and also lookup details about the user that placed the order. We want to combine this information to display the user's name next to the id of the product they have ordered. We might try to do this with the following code:

```ts
const getOrderSummary = (orderId: string) => {
  return (
    fetchOrder(orderId)
      .then((order) => fetchUser(order.userId))
      // Error on the next line because `order` is not in scope!
      .then((user) => `${user.name} | ${order.productId}`)
  );
};
```

But as you can see this doesn't work because each individual `.then` callback has its own isolated scope. We can't access variables in one scope from a different scope. There is a way to get around this by passing along the variable with the chained task:

```ts
const getOrderSummary = (orderId: string) => {
  return fetchOrder(orderId)
    .then((order) => Promise.all([order, fetchUser(order.userId)]))
    .then(([order, user]) => `${user.name} | ${order.productId}`);
};
```

But this is very unusual and I find very difficult to read and maintain. If however we use `async/await` instead, there is no problem at all:

```ts
const getOrderSummary = async (orderId: string) => {
  const order = await fetchOrder(orderId);
  const user = await fetchUser(order.userId);
  return `${user.name} | ${order.productId}`;
};
```

Because the `await` keyword exposes the resolved value in the same scope that we start in, it is much easier to combine results from different stages of the asynchronous task.

## Hybrid: Getting the best of both

So we've seen at least one example where a `Promise` is best, and another where `async/await` is best. How can we get the best of both?

Since Async/Await is just syntactic sugar for promises, we can mix and match the two syntaxes together. This unlocks the power of parallel promises with `Promise.all` while also getting the shared variable scoping of `await` like so:

```ts
const getOrderDetails = async (orderId: string) => {
  const order = await fetchOrder(orderId);

  const [user, product] = await Promise.all([
    fetchUser(order.userId),
    fetchProductDetails(order.productId),
  ]);

  return `${order.timestamp} | ${user.name} | ${product.name}
};
```

In this final example, we fetch an order by its id, then _in parallel_ we fetch user and product details. We return a summary including the order, user, and product information.

## Summary

Many people like to argue about Promises vs. Async/Await, but in truth, they are different tools with different specialties. You should learn to understand and use both and apply each where it will be most effective.

Take care,

Rupert
