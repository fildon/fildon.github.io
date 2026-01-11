---
title: Understanding React Dependency Arrays
description: Common pitfalls of Dependency Arrays, and how best to use them.
date: 2021-06-20
layout: layouts/post.njk
---

Several of React's hooks take a 'dependency array' argument. In this post, I will talk about different ways to use dependency arrays and some common pitfalls.

## What is a Dependency Array?

Dependency arrays are how we tell React when to update a hook. Here are all the hooks that can take a dependency array:

- useEffect
- useCallback
- useMemo
- useImperativeHandle
- useLayoutEffect

In each case, when React detects a change in any value of a dependency array, the given hook will update in some way. For example, `useEffect` will rerun its callback, whereas `useCallback` will recompute the memoized function it returns.

## Typical Usage

```ts
React.useEffect(() => {
	document.title = isLoggedIn ? "✅ Welcome ✅" : "⛔ Please Login ⛔";
}, [isLoggedIn]);
```

In this example, we update the document title to indicate whether the current user is logged in. We don't want to run this effect on every render, only when the `isLoggedIn` value changes.

As a rule of thumb, you should include _every_ value your callback depends on in the dependency array. The React team publish and maintain an `eslint` plugin to verify that you do this, I highly recommend it: [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)

## Empty Array

React will run all hooks the first time a component mounts, but by providing an empty array, we indicate to React that we never want our hook to rerun after that. This pattern is especially useful for simulating an "on mount" effect.

For example, suppose we have a timer, which counts each second:

```ts
const [count, setCount] = React.useState(0);
React.useEffect(() => {
	const interval = setInterval(() => {
		setCount((oldVal) => oldVal + 1);
	}, 1000);
	return () => clearInterval(interval);
}, []);
```

By providing an empty array here, we initialize our `setInterval` logic only once when the component first mounts. The interval will keep running as long as our component is mounted. We don't want to rerun this `useEffect` more than once, or else we would have multiple intervals running, each trying to update the same state. Note also that we pass a callback to `setCount` rather than need to depend on the current value of `count`. You can read more about this particular feature of `useState` in the React docs here: [Functional Updates](https://reactjs.org/docs/hooks-reference.html#functional-updates)

## Omitting the Dependency Array

If passing an empty array corresponds to never rerunning, then passing nothing at all corresponds to _rerunning on every render_.

```ts
React.useEffect(() => {
	logger.info("Rendered MyComponent");
});
```

In this example, we write to our logger every time our component is rendered. I recommend doing this only very sparingly since in a typical React application this would produce an awful lot of noise in our logs. But I will occasionally do this when trying to measure how often a component rerenders.

---

## Common Pitfalls

Now that we understand how to pass a dependency array, let's look at some common mistakes.

### Object References

```ts
React.useEffect(() => {
	displayWelcomeMessage(user.firstName, user.lastName);
}, [user]);
```

Here `user` is an object. React will detect that an object has changed _if and only if_ its reference has changed. In this example, the user's name might have changed between renders, but the reference to `user` might not. If so the welcome message we want to display will continue to display old data even after the user has changed their name. To fix this, be specific about the values you depend on in your dependency array:

```ts
React.useEffect(() => {
	displayWelcomeMessage(user.firstName, user.lastName);
}, [user.firstName, user.lastName]);
```

### Array References

```ts
React.useEffect(() => {
	notifyUsers(users);
}, [users]);
```

Here `users` is an array. As before, React will detect that an array has changed _if and only if_ its reference has changed. In this example, that means that adding, removing, or modifying a user inside the `users` array will not cause the hook to fire. To fix this we can spread our array inside the dependency array:

```ts
React.useEffect(() => {
	notifyUsers(users);
}, [...users]);
```

### Function References

```ts
const postUserDataToServer = (user) => api.post(user);
const onSignUp = React.useCallback(
	(signUpFormData: User) => {
		postUserDataToServer(signUpFormData);
	},
	[postUserDataToServer]
);
```

In this example `postUserDataToServer` is passed as a dependency to our `onSignUp` callback. Unfortunately, since `postUserDataToServer` is defined within the same component, it is redefined on every render, and hence is a new function on every render.

To fix this we can either memoize the function, or define it only inside the useCallback:

```ts
const onSignUp = React.useCallback((signUpFormData: User) => {
	const postUserDataToServer = (user) => api.post(user);
	postUserDataToServer(signUpFormData);
}, []);
```

### +0 vs -0

According to both `==` and `===`, +0 and -0 are equal. Unfortunately, React uses `Object.is` to check for changes in a dependency array.

```ts
0 == -0; // true
0 === -0; // true
Object.is(0, -0); // false
```

If our dependency array includes a number that changes between +0 and -0, then our hook might fire more often than we want. Firing too often can impact performance, but is rarely a cause of bugs. Even so, it is good to be aware of this quirk, when it comes time to debug a hook that is firing at unexpected times.

## Summary

- Passing an empty array runs only on mount
- Passing nothing runs on every render
- Changes are detected with `Object.is`
