---
title: How to Create Custom Hooks.
description: DRY component logic and separation of rendering from state management.
date: 2021-06-09
layout: layouts/post.njk
---
React hooks are a powerful tool for managing state in your React components. In this post I'll be demonstrating how we can compose existing React hooks to make custom hooks that encapsulate reusable functionality.

React's built-in hooks provide a great deal of power and flexibility, between `useState`, `useEffect` and `useCallback` we can cover very many use cases. But often times we'll find ourselves repeating a pattern of hooks over and over again, or maybe we'd simply prefer to pull out a custom hook to keep our component definitions short and expressive.

Let's start with some small examples and work our way up to something bigger.

## useOnMount

A common hook pattern is `useEffect` with an empty dependency array to run some function only when the component first mounts. For example:

```ts
const WelcomePage = () => {
  React.useEffect(() => {
    recordUserVisit();
  }, []);

  return <span>Welcome!</span>;
};
```

Here we have a `WelcomePage` component which makes a call to some utility method to record user visits. We don't want to record another visit every time this component rerenders, only the first time it mounts. We could leave this exactly as is, but I don't find the empty dependency array very expressive of the intent here. When breaking larger functions into smaller functions, one of the benefits is creating opportunities to express intent. The same applies to React hooks, they are just functions after all! So lets pull out a little well named hook which expresses this "on mount" intent:

```ts
const useOnMount = (callback: () => void) => {
  React.useEffect(callback, []);
};
```

Now our `WelcomePage` is just:

```ts
const WelcomePage = () => {
  useOnMount(recordUserVisit);

  return <span>Welcome!</span>;
};
```

That might not seem like a big change, but I find myself reusing this in a lot of places!

## useToggle

For simple pieces of boolean state we typically only want a way to read the current value and a way to flip the current value. Here's how we might encapsulate that in a hook:

```ts
const useToggle = (initialValue: boolean) => {
  const [value, setValue] = React.useState(initialValue);
  const toggle = () => setValue(!value);

  return { value, toggle };
};
```

Then we could use it in say an `OnOffButton` like so:

```ts
const OnOffButton = () => {
  const { value: isOn, toggle } = useToggle(false);

  return <button onClick={toggle}>{isOn ? "🌞" : "🌚"}</button>;
};
```

Super simple, and lots of opportunity for reuse.

## useCircularIndex

This next example is a little more complex. Perhaps you have a list of images in a carousel and you want a way to cycle between them. When the user tries to navigate off the end of the list, you actually want them to go back to the first one. That's some interesting behaviour that we can encapsulate in a hook:

```ts
const useCircularIndex = (length: number) => {
  const [index, setIndex] = React.useState(0);
  const next = () => setIndex(index === length - 1 ? 0 : index + 1);
  const prev = () => setIndex(index === 0 ? length - 1 : index - 1);

  return { index, next, prev };
};
```

Components that use this hook no longer need to worry about handling index out of bounds errors and can rest assured always receive a valid index for a given array length.

```ts
const ImageGallery = ({ images }: ImageGalleryProps) => {
  const { index, next, prev } = useCircularIndex(images.length);

  return (
    <>
      <button onClick={prev}>Previous</button>
      <img src={images[index].src} />
      <button onClick={next}>Next</button>
    </>
  );
};
```

## Refactoring a larger component

Now let's consider a bigger example. Here we have a `UserProfile` component:

```ts
const UserProfile = ({ userId }: UserProfileProps) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [userDetails, setUserDetails] =
    React.useState<UserDetails | null>(null);

  React.useEffect(() => {
    setIsLoading(true);
    getUserDetails(userId)
      .then((result) => setUserDetails(result))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (error) {
    return <span>Something went wrong. Please try again.</span>;
  }

  if (isLoading || !userDetails) {
    return <span>Loading...</span>;
  }

  return (
    <section>
      <h3>{userDetails.userName}</h3>
      <img src={userDetails.imgSource} />
      <p>{userDetails.userBio}</p>
    </section>
  );
};
```

Phew! That's a lot of stuff going on. Tragically though I see a lot of components that look like this. If we just look at the last return statement, we can see that this component was originally intended to be a really simple display of some user information, but it became bloated with a lot of state management, which distract from the original intentions.

The quickest way to begin refactoring this is to pull out everything above the first return statement into a new function. Let's call this function `useGetUserDetails`. When I first do this to a component, I'll initially leave the new hook in the same file.

```ts
const useGetUserDetails = (userId: string) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [userDetails, setUserDetails] =
    React.useState<UserDetails | null>(null);

  React.useEffect(() => {
    setIsLoading(true);
    getUserDetails(userId)
      .then((result) => setUserDetails(result))
      .then((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  return { userDetails, error, isLoading };
};

const UserProfile = ({ userId }: UserProfileProps) => {
  const { userDetails, error, isLoading } = useGetUserDetails(userId);

  if (error) {
    return <span>Something went wrong. Please try again.</span>;
  }

  if (isLoading || !userDetails) {
    return <span>Loading...</span>;
  }

  return (
    <section>
      <h3>{userDetails.userName}</h3>
      <img src={userDetails.imgSource} />
      <p>{userDetails.userBio}</p>
    </section>
  );
};
```

As a first step this already greatly clarifies the `UserProfile` component. But there's still more we could do here, in particular the relationship between `isLoading`, `error` and `userDetails` could be enforced more explicitly:

```ts
type LoadingState = { state: "loading" };
type ErrorState = { state: "error"; error: unknown };
type ReadyState = { state: "ready"; userDetails: UserDetails };

type UserDetailsResponse = LoadingState | ErrorState | ReadyState;

const useGetUserDetails = (userId: string) => {
  const [response, setResponse] = React.useState<UserDetailsResponse>({
    state: "loading",
  });

  React.useEffect(() => {
    getUserDetails(userId)
      .then((response) =>
        setResponse({ state: "ready", userDetails: response })
      )
      .catch((error) => setResponse({ state: "error", error }));
  }, [userId, getUserDetails]);

  return { response };
};
```

We are using a [discriminated union](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) here to manage the relationship between the three states our data might be in. This is a pretty advanced TypeScript topic, and one I'll write about in another post, so don't worry too much about that detail here.

With this new hook our `UserProfile` becomes:

```ts
const UserProfile = ({ userId }: UserProfileProps) => {
  const { response } = useGetUserDetails(userId);

  switch (response.state) {
    case "error":
      return <span>Something went wrong. Please try again.</span>;

    case "loading":
      return <span>Loading...</span>;

    case "ready": {
      const { userDetails } = response;
      return (
        <section>
          <h3>{userDetails.userName}</h3>
          <img src={userDetails.imgSource} />
          <p>{userDetails.userBio}</p>
        </section>
      );
    }
  }
};
```

I find this version of `UserProfile` much clearer than our first version. We can see right away it tries to get some user data, and then renders one of three things based on the state of the response. Additionally `UserProfile` has become exceptionally easy to test. We can mock out `useGetUserDetails` and write three tests to confirm each of the different rendering cases.

Likewise we can independently test `useGetUserDetails` in isolation from any particular rendering concerns. I'm a big fan of [React Hooks Testing Library](https://react-hooks-testing-library.com/) for this.

For sufficiently simple components, this might be a premature optimisation and in general we should [Avoid Hasty Abstractions](https://kentcdodds.com/blog/aha-programming), but under the right conditions this separation between rendering and state management can leave us with code which is easier to read and maintain.

In this post we have walked through the process of creating custom hooks. Now get out there and simplify your components!
