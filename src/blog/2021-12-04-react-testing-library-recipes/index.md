---
title: React Testing Library Recipes
description: Common testing patterns for creating confidence in your UI tests.
date: 2021-12-04
layout: layouts/post.njk
---

As long as I've been working in frontend development, the tools available for testing UIs have felt clunky, hard to use, and not filled me with confidence that they reflect real end-user experiences.

I was especially tired of libraries that directly leaned on DOM queries or imperatively fired DOM events. This felt much too much like testing implementation details to me. But when I first saw Testing Library I knew it was different. Its documentation starts with this fantastic sentiment:

> [The more your tests resemble the way your software is used, the more confidence they can give you.](https://testing-library.com/docs/guiding-principles)

Testing Library approaches UI testing with a user-first attitude. Expectations are declared in terms of what is rendered _to the user_ and interactivity is simulated only in ways _that a real user could do_.

I've been using Testing Library for about two years now and I've found myself developing a handful of testing recipes that I use over and over again. I'd like to present them to you now because I think they will help you in getting the most out of your UI tests.

## Recipes

All of the below recipes are included in a repository over here: [React Testing Library Recipes](https://github.com/fildon/react-testing-library-recipes). Feel free to clone the repo and run the tests for yourself to try them out locally.

### 1 - Basic Recipe

Let's start with something very basic. The classic counter component:

```ts
import * as React from "react";

export const Counter = () => {
	const [count, setCount] = React.useState(0);

	const incrementCount = () => setCount((c) => c + 1);

	return <button onClick={incrementCount}>{count}</button>;
};
```

To test this we would like to know what is presented to the user and also what interactivity is available to the user:

```ts
import * as React from "react";

import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";

import { Counter } from "./counter";

it("displays initial count and increments when clicked", () => {
	render(<Counter />);

	expect(screen.getByRole("button", { name: "0" })).toBeInTheDocument();

	userEvent.click(screen.getByText("0"));

	expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
});
```

In this test, we confirm that the `Counter` component initially renders a "0" but after it has been clicked then displays a "1".

We could have also used `getByText` queries, but I like the additional implied check of `getByRole` since this helps our tests to confirm the accessibility of our components. Testing Library docs have a great guidance page on which queries you should prefer: [Query priorities](https://testing-library.com/docs/queries/about#priority).

Note also that in this test we simulate user interaction with the `userEvent` library. We could also have used `fireEvent` from `@testing-library/react`, but Testing Library recommends preferring the `userEvent` library. You can see this at the top of the page here: [Firing Events](https://testing-library.com/docs/dom-testing-library/api-events).

### 2 - Negative Recipe

Sometimes we want to confirm that something _was not rendered_. Suppose we have a welcome banner that displays a different message depending on whether the user is logged in or not:

```ts
// user is null if not currently logged in
export const WelcomeHeading = ({ user }: { user: User | null }) => {
	const message =
		user === null
			? "Welcome Guest, would you like to log in?"
			: `Welcome ${user.name}, good to have you back!`;

	return <h2>{message}</h2>;
};
```

Then we can test that we get the message that we expected and also that the other message was not displayed.

```ts
it("displays personalized message if the user is logged in", () => {
	const mockUser = { name: "Rupert" };
	render(<WelcomeHeading user={mockUser} />);

	expect(
		screen.queryByRole("heading", {
			name: "Welcome Guest, would you like to login?",
		})
	).not.toBeInTheDocument();
	expect(
		screen.getByRole("heading", {
			name: "Welcome Rupert, good to have you back!",
		})
	).toBeInTheDocument();
});
```

Notice that we have to use the `queryByRole` method here. This is because all the `getBy*` queries immediately throw an error if they cannot find any matching element. Which would immediately fail our unit test. Instead `queryBy*` queries return `null` if no match is found. This works perfectly in combination with `.not.toBeInTheDocument()`.

You might also find this recipe useful to test that a modal was closed or that a notification can be dismissed.

### 3 - Async Recipe

Finally, let's look at how to handle a component with some asynchronous behavior. The following component makes a call to some API on mount. It initially displays a loading message, but once the API promise resolves it can display the information it received.

```ts
import * as React from "react";

import { fetchTemperatureFromApi } from "./temperatureApi";

type LoadingState = { type: "loading" };
type ErrorState = { type: "error"; errorMessage: string };
type SuccessState = { type: "success"; temperature: number };

type ComponentState = LoadingState | ErrorState | SuccessState;

export const CurrentTemperature = () => {
	const [state, setState] = React.useState<ComponentState>({
		type: "loading",
	});

	React.useEffect(() => {
		fetchTemperatureFromApi()
			.then((temperature) => setState({ type: "success", temperature }))
			.catch((error) =>
				setState({ type: "error", errorMessage: JSON.stringify(error) })
			);
	}, []);

	if (state.type === "error") return <span>{state.errorMessage}</span>;
	if (state.type === "loading") return <span>LOADING...</span>;

	return <span>{`Today's temperature is ${state.temperature}`}</span>;
};
```

For this test suite, we first want to mock out the API dependency so that we can simulate different situations.

> I've written about mocking in Jest before, so if you'd like a little refresher you can read [Mocking in Jest with TypeScript and React](https://rupertmckay.com/blog/mocking-in-jest-with-typescript-and-react). I'll be following the mocking strategy described in that post.

```ts
import * as React from "react";
import { render, screen } from "@testing-library/react";

import { CurrentTemperature } from "./temperature";
import { fetchTemperatureFromApi } from "./temperatureApi";

jest.mock("./temperatureApi", () => ({
	fetchTemperatureFromApi: jest.fn(),
}));

const mockFetchTemperatureFromApi =
	fetchTemperatureFromApi as jest.MockedFunction<
		typeof fetchTemperatureFromApi
	>;

beforeEach(() => {
	jest.clearAllMocks();
});

it("displays current temperature when API resolves", async () => {
	// Simulate an API call taking half a second to resolve
	mockFetchTemperatureFromApi.mockImplementation(
		() => new Promise((res) => setTimeout(() => res(20), 500))
	);

	render(<CurrentTemperature />);

	expect(screen.getByText("LOADING...")).toBeInTheDocument();

	expect(
		await screen.findByText("Today's temperature is 20")
	).toBeInTheDocument();
});

it("displays error message in case of API failure", async () => {
	// Simulate an API call failing
	mockFetchTemperatureFromApi.mockRejectedValue("mock error");

	render(<CurrentTemperature />);

	expect(screen.getByText("LOADING...")).toBeInTheDocument();

	expect(await screen.findByText(/mock error/)).toBeInTheDocument();
});
```

In this test suite, we simulate two different cases, one in which the API rejects with a failure and another in which it resolves successfully, but only after some time. In both cases, we can verify that the loading message is immediately displayed, but to confirm what happens next, we need to wait for the component to rerender once the API call has resolved (successfully or not). To do that we use a `findBy` query which returns a promise that resolves when a match is found. By default, it reattempts finding a match every 50ms but times out after 1000ms. Both of these numbers are configurable, however.

## Conclusions

- `getBy*` verifies that something is rendered.
- `queryBy*` can be used to verify that something is _not_ rendered.
- `findBy*` verifies that something is _eventually_ rendered.
- Prefer `*ByRole` wherever possible to encourage the use of semantic HTML and better accessibility.
- Use the companion library [testing-library/user-event](https://github.com/testing-library/user-event) to simulate realistic user actions.

The three examples above might not seem like much, but these recipes cover 99% of the cases I find in my work. Leave a comment below if these recipes are useful to you, or if you think you have a common use case not addressed by any of these.

Take care,
Rupert
