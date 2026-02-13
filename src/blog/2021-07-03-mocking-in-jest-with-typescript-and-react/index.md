---
title: Mocking in Jest with TypeScript and React
description: Practical guide to mocking in Jest with TypeScript. Learn type-safe mock functions and how to mock React components effectively.
date: 2021-07-03
layout: layouts/post.njk
---

Key takeaways:

- `jest.mock` covers many use cases
- `jest.MockedFunction<typeof YourFunction>` is the best for type-safe mock functions
- Don't be afraid to mock React components _they are just functions!_

## Getting started with mocking

Let's suppose we have a simple `User` component that displays the user's name, or "Guest" if no user was found:

```ts
import * as React from "react";
import { getUserDetails } from "./user-storage";

interface UserProps {
  userId: string;
}

export function User({ userId }: UserProps): JSX.Element {
  // Get information about the user from some external resource
  const user = getUserDetails(userId);

  // Use the user's name, or "Guest" if no user was found
  const displayName = user ? user.name : "Guest";

  return (
    <section>
      <h2>{displayName}</h2>
    </section>
  );
}
```

## Attempt #1

Here's what a first attempt at testing this component might look like:

```ts
import * as React from "react";
import { render, screen } from "@testing-library/react";

import { User } from "./user";

describe("User component", () => {
  it("displays the user's name", () => {
    // Render the component with some dummy user ID
    render(<User userId="1234" />);

    // Expect the component to have rendered the user's name
    expect(screen.getByText("rupert")).toBeInTheDocument();
  });
});
```

Unfortunately, when we run this it doesn't work! We tried to render our `User` component, by passing it a user ID `1234`, which gets passed to `getUserDetails`, and then we expected our component to render the name `rupert`. The problem is that maybe `getUserDetails` depends on a database or some network calls, which we don't have available while running our tests. Whatever `getUserDetails` needs to work... _this test shouldn't care about that_. So let's mock it!

The quickest and easiest way to do that is with [jest.mock](https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options):

## Using Jest module factory

```ts
import * as React from "react";
import { render, screen } from "@testing-library/react";

import { User } from "./user";

jest.mock("./user-storage", () => ({
  // Mock implementation that just always returns "rupert"
  getUserDetails: () => ({ name: "rupert" })
})

describe("User component", () => {
  it("displays the user's name", () => {
    render(<User userId="1234" />);

    expect(screen.getByText("rupert")).toBeInTheDocument();
  });
});
```

The first argument to `jest.mock` is the path to the module you want to mock, and the second is your custom implementation of that module which will replace the "real" thing during the tests in this file.

This works! But there are some weaknesses here.

Before I go on, I want to make 100% clear that the above snippet may well be sufficient in _very many cases_. What follows after this point is only necessary if you want even more confidence in your tests.

The first weakness to point out is that despite being in TypeScript, we don't actually have any type guarantee on our mocked implementation. If for example I had a typo in the mock implementation:

```ts
jest.mock("./user-storage", () => ({
  // O no my finger slipped and I pressed "a" too many times
  getUserDetails: () => ({ naaaaaaaame: "rupert" })
})
```

TypeScript doesn't know that this is an invalid implementation of `getUserDetails` _even though_ the real `getUserDetails` is strictly typed. TypeScript is not able to check that for us, because, inside the `jest.mock` call, TypeScript can't tell what "real" module we are talking about. As far as TypeScript is concerned the first argument to `jest.mock` _is just a string_ and the second argument _is just some anonymous function_. It has no reason to believe they should match up with any "real" types it already knows about.

There are some ways to give it a hint though:

```ts
// Import a reference to the "real" function
import { getUserDetails } from "./user-storage";

// Declare that our mock implementation must return a valid "getUserDetails" implementation
jest.mock("./user-storage", (): { getUserDetails: typeof getUserDetails } => ({
	// TypeScript will now correctly tell us this doesn't match the expected type
	getUserDetails: () => ({ naaaaaaaame: "rupert" }),
}));
```

But I really don't like that, the syntax is clunky and for larger modules, gets unwieldy very quickly. We can streamline it a bit like so:

```ts
// This time we import the whole module namespace
import * as UserStorage from "./user-storage";

// And use the 'typeof' that namespace to enforce our mock matches
jest.mock("./user-storage", (): typeof UserStorage => ({
	// Correctly tells us this doesn't match the expected type
	getUserDetails: () => ({ naaaaaaaame: "rupert" }),
}));
```

This also works. But I'm still not in love with it. Having to import the whole namespace just to mock a single function is over the top. I liked it when we could import just the one thing we wanted to mock. But how can we do that while still getting strict type checking on our mock implementations?

The trick here is actually to take a step back from Jest module factories, and instead, let Jest handle more of the mocking automatically for us:

```ts
jest.mock("./user-storage");
```

That's it! No factory! If you don't provide a second argument to `jest.mock`, Jest will inspect the module at that path and automatically mock out all exported members with mocks that do nothing. Depending on your situation that might be enough. But we know in our example we do need `getUserDetails` to return some realistic data. So how can we get the best of both automatically mocking the whole module, while also providing custom behavior to one specific exported member? To do this we will need to retain a reference to the exported member we care about so that we can manipulate it in some way:

## Keeping a reference to our mocks

```ts
import * as React from "react";
import { render, screen } from "@testing-library/react";
import { User } from "./user";

// This module will be mocked, but we grab a reference for later
import { getUserDetails } from "./user-storage";

// Let Jest do its automocking magic
jest.mock("./user-storage");

describe("User component", () => {
  // Let TypeScript know that this thing is a mock
  const mockGetUserDetails = getUserDetails as jest.MockedFunction<
    typeof getUserDetails
  >;
  // Provide our custom implementation here
  mockGetUserDetails.mockImplementation(() => ({ name: "rupert" }));

  it("displays the user's name", () => {
    render(<User userId="1234" />);

    expect(screen.getByText("rupert")).toBeInTheDocument();
  });
});
```

This might look a little funky at first. It looks like we are assigning the "real" `getUserDetails` to some fake `mockGetUserDetails`... but we also cast it with an `as` using [jest.MockedFunction](https://jestjs.io/docs/mock-function-api#jestmockedfunction)... is that correct? Yes! And it gets at an important little quirk of the way Jest and TypeScript interact.

Jest modifies mocked modules _at runtime_, it does so in a way that leaves the mocked module compatible with its original type but wraps everything to provide mock utility methods such as `mockImplementation`. But TypeScript doesn't "see" that this has happened, so we have to help it out. If we didn't do this `as` assignment then TypeScript would forbid us from calling `mockImplementation` on `getUserDetails`, because for all TypeScript knows `getUserDetails` doesn't have a `mockImplementation` method. But we know that Jest added that while mocking the module. So this line is necessary just to get TypeScript to understand that Jest has modified the module in some way.

This might seem like a lot of work just to get to the same point we had with our first jest module factory approach, but it now opens up a lot of new interesting possibilities.

For instance we can now assert that the mock was called:

```ts
it("displays the user's name", () => {
  render(<User userId="1234" />);

  // Confirm that the mock was called with the correct arguments
  expect(mockGetUserDetails).toHaveBeenCalledWith("1234");
  expect(screen.getByText("rupert")).toBeInTheDocument();
});
```

We can also change the behaviour of the mock on the fly:

```ts
it("displays the user's name", () => {
  render(<User userId="1234" />);

  // We can add an expectation here that the mock was called with the correct arguments
  expect(mockGetUserDetails).toHaveBeenCalledWith("1234");
  expect(screen.getByText("rupert")).toBeInTheDocument();

  // Change the mock implementation to simulate no user found
  mockGetUserDetails.mockImplementation(() => null);

  render(<User userId="1234" />);

  // Expect the new behaviour to be reflected in what our component renders
  expect(screen.getByText("Guest")).toBeInTheDocument();
});
```

A big thing to watch out for when doing this though is that mock implementations persist between unit tests in the same file. If a test changes the behavior of a mock, tests that run afterward will get that new behavior. This is rarely what we want since our tests should be completely isolated and independent. To enforce that principle we can set up a mock implementation in a `beforeEach` block:

```ts
beforeEach(() => {
  mockGetUserDetails.mockImplementation(() => ({
    name: "rupert",
  }));
});

it("displays the user's name", () => {
  render(<User userId="1234" />);

  // Correctly works with the default mock implementation
  expect(screen.getByText("rupert")).toBeInTheDocument();
});

it("displays 'Guest' if the user is not found", () => {
  // Simulate no user being found
  mockGetUserDetails.mockImplementation(() => null);

  render(<User userId="1234" />);

  // Works with the one-off implementation provided just above
  expect(screen.getByText("Guest")).toBeInTheDocument();
});
```

Now whatever order our tests run in, they all start with the same mock implementation provided.

I really like this pattern when many tests can rely on a sensible "happy path" default, while just a few tests can try out specific edge cases, without affecting any other tests.

One other thing we really need to watch out for here though is making sure we clear our mocks between tests. If in the above example we added a third test:

```ts
it("something is fishy here", () => {
	expect(mockGetUserDetails).toHaveBeenCalledWith("1234");
});
```

That test will pass! But how? It doesn't do anything, yet somehow it is still true that the mock was called with that argument. Well, just like mock implementations persist through the whole test file, so too does the mock's "memory" of when it has been called. To prevent this confusing behavior, we should clear the "memory" of mocks between tests:

```ts
beforeEach(() => {
	jest.clearAllMocks();
});
```

This is such a regular thing to need to do in every test file that Jest provides a config option to just always do it everywhere [clearMocks](https://jestjs.io/docs/configuration#clearmocks-boolean). This option defaults to 'false' but if you find yourself writing `jest.clearAllMocks()` in a lot of files, you might want to try turning that option on.

Before moving on to the next section, here is a full copy of our test file so far, featuring a type-safe mock, we can assert against whilst also configuring different behaviors per test:

```ts
import * as React from "react";
import { render, screen } from "@testing-library/react";

import { getUserDetails } from "./user-storage";
import { User } from "./user";

jest.mock("./user-storage");

describe("User component", () => {
  const mockGetUserDetails = getUserDetails as jest.MockedFunction<
    typeof getUserDetails
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserDetails.mockImplementation(() => ({ name: "rupert" }));
  });

  it("displays the user's name", () => {
    render(<User userId="1234" />);

    expect(mockGetUserDetails).toHaveBeenCalledWith("1234");
    expect(screen.getByText("rupert")).toBeInTheDocument();
  });

  it("displays 'Guest' if the user is not found", () => {
    mockGetUserDetails.mockImplementation(() => null);
    render(<User userId="1234" />);

    expect(mockGetUserDetails).toHaveBeenCalledWith("1234");
    expect(screen.getByText("Guest")).toBeInTheDocument();
  });
});
```

## Mocking a React Component

Now let's pretend our `User` component also depends on some third party widget component:

```ts
import * as React from "react";
import { getUserDetails } from "./user-storage";
import { ThirdPartyWidget } from "third-party-library";

interface UserProps {
  userId: string;
}

export function User({ userId }: UserProps): JSX.Element {
  const user = getUserDetails(userId);
  const displayName = user ? user.name : "Guest";
  return (
    <section>
      <h2>{displayName}</h2>
      <ThirdPartyWidget userId={userId} />
    </section>
  );
}
```

As before let's assume that we don't actually want to run this dependency during our tests. So how can we mock it? React components are just functions, and we can mock them just like any other function, just like we have done already in this post:

```ts
import { ThirdPartyWidget } from "third-party-library";

jest.mock("third-party-library");

describe("User component", () => {
  const mockThirdPartyWidget = ThirdPartyWidget as jest.MockedFunction<
    typeof ThirdPartyWidget
  >;
  // Mock this component to just always render an empty fragment
  mockThirdPartyWidget.mockImplementation(() => <></>);
});
```

This works _exactly_ the same way as before. In this case, we just choose to mock the component by returning an empty fragment which is the shortest way to satisfy a `JSX.Element` return type.

There is one slight quirk with this though. We can assert that the `mockThirdPartyWidget` has been called like so:

```ts
expect(mockThirdPartyWidget).toHaveBeenCalled();
```

But if we want to assert exactly what arguments it was called with it gets a little fiddly. You might think the following would work:

```ts
expect(mockThirdPartyWidget).toHaveBeenCalledWith({ userId: "1234" });
```

But what we find in practice is that it was called with two arguments: `{ userId: "1234" }, {}`. This is due to the way that `React.createElement` invokes custom components under the hood. The empty object corresponds to any React contexts that are available to this element. Since we know we aren't using any React context in this test we can simply add this empty object to our expectation:

```ts
expect(mockThirdPartyWidget).toHaveBeenCalledWith({ userId: "1234" }, {});
```

But when we inevitably do want to test a component rendered within a context, I find the following compromise acceptable:

```ts
expect(mockThirdPartyWidget).toHaveBeenCalledWith(
	{ userId: "1234" },
	expect.any({}), // Ignore React contexts
);
```

So finally our test file is now:

```ts
import * as React from "react";
import { render, screen } from "@testing-library/react";

import { getUserDetails } from "./user-storage";
import { ThirdPartyWidget } from "third-party-widget";
import { User } from "./user";

jest.mock("./user-storage");
jest.mock("third-party-widget");

describe("User component", () => {
  const mockGetUserDetails = getUserDetails as jest.MockedFunction<
    typeof getUserDetails
  >;
  const mockThirdPartyWidget = ThirdPartyWidget as jest.MockedFunction<
    typeof ThirdPartyWidget
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserDetails.mockImplementation(() => ({ name: "rupert" }));
    mockThirdPartyWidget.mockImplementation(() => <></>);
  });

  it("displays the user's name", () => {
    render(<User userId="1234" />);

    expect(mockGetUserDetails).toHaveBeenCalledWith("1234");
    expect(screen.getByText("rupert")).toBeInTheDocument();
  });

  it("displays 'Guest' if the user is not found", () => {
    mockGetUserDetails.mockImplementation(() => null);
    render(<User userId="1234" />);

    expect(mockGetUserDetails).toHaveBeenCalledWith("1234");
    expect(screen.getByText("Guest")).toBeInTheDocument();
  });

  it("mounts the third party widget", () => {
    render(<User userId="1234" />);

    expect(mockThirdPartyWidget).toHaveBeenCalledWith(
      { userId: "1234" },
      expect.any({})
    );
  });
});
```

And there you have it. Flexible yet type-safe mocks that work for any function _including_ React components.

Summary:

- `jest.mock` covers many use cases
- `jest.MockedFunction<typeof YourFunction>` is the best for type-safe mock functions
- Don't be afraid to mock React components _they are just functions!_

Take care,

Rupert

---

Library versions used when writing this post:

| Dependency               | Version |
| ------------------------ | ------- |
| `jest`                   | 27.0.6  |
| `react`                  | 17.0.2  |
| `typescript`             | 4.3.5   |
| `@testing-library/react` | 12.0.0  |
