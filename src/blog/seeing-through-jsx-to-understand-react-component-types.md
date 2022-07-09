---
title: Seeing through JSX to understand React Component types.
description: Why you shouldn't use React.FC.
date: 2021-06-27
layout: layouts/post.njk
---
Here are the big takes right away:

- Don't use `React.FC`.
- Explicitly type your props _including permitted `children` types_.
- Prefer inferred return types, but `JSX.Element` if you have to.

To justify these claims, we will peek behind the JSX curtain to see what's really going on.

## What is JSX _really_?

_It is a lie._

JSX is a special kind of syntax _which JavaScript can't run_. You can see from [the original JSX proposal](https://facebook.github.io/jsx/) that it was never intended to be something that can be run by JavaScript engines directly. Instead, it requires some transpiler to boil it down to a series of `createElement` calls, which _are just plain old JavaScript functions_. Depending on your stack, you probably do this transpilation with either `Babel` or `TypeScript`.

_**Disclaimer**: Neither Babel, TypeScript nor React have a monopoly on JSX_; go take a look at [Preact](https://preactjs.com/) for example, if you haven't already.

To really understand this transpilation, let's inspect some examples:

_I have lightly edited the Babel output for clarity_ but you can try these with this fancy link that encodes these examples in the [Babel REPL](https://babeljs.io/repl/#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&corejs=3.6&spec=false&loose=false&code_lz=GYVwdgxgLglg9mABACQKYBt1wBQAcBOcuAzgJSIDeAUIovqlCPkgDzG4CGSAFjACZ9UYAHwUCRYgDoAtqmLEOAc1QBfFgHp2XYQG4qKqlVCRYCRAFkQ6WAGFe6PvTDZy1WvUbNE2GrURtUaHgRXz9_NEw4RFl5JVQAXgAiAEkAcmlEDkQIez5EOGBEKG5URGJA0zBExHVhUL8WCKxouQVlJK482SK4OGra-tpGjGaYtoTE7uL6VABCfrqwjXKghEXEUn0qIA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=react&prettier=false&targets=&version=7.14.7&externalPlugins=)

```js
// Before Babel
function Hello(props) {
  return <span hidden>{props.message}</span>;
}

// After Babel
function Hello(props) {
  return React.createElement("span", { hidden: true }, props.message);
}
```

In this example the `Hello` component demonstrates how primitive HTML elements are converted to a `createElement` taking three arguments:

| Args              | Value              |
| ----------------- | ------------------ |
| HTML element name | `"span"`           |
| Attributes object | `{ hidden: true }` |
| Children          | `props.message`    |

But what if we have multiple children, or reference other React components:

```js
// Before Babel
function MultiChildren() {
  return (
    <section>
      <Hello message="I'm a child of the section" />
      <Hello message="and me too" />
      <Hello message="me three!" />
    </section>
  );
}

// After Babel
function MultiChildren() {
  return React.createElement(
    "section",
    null,
    React.createElement(Hello, { message: "I'm a child of the section" }),
    React.createElement(Hello, { message: "and me too" }),
    React.createElement(Hello, { message: "me three!" })
  );
}
```

The `MultiChildren` component is very similar but reveals a few more interesting features. Firstly, the first argument to `createElement` can be a _function reference_ to another React component, which is the `Hello` component. Secondly, `createElement` can take more than three arguments to accommodate multiple children. Finally, if no attributes are provided `null` is used.

As an aside, have you ever wondered why you need to import `React` into a JSX file, even when you don't reference it directly? Well now you can see, it is because _you actually do!_ It is just hidden behind JSX transpilation. `React` has to be in scope so that `createElement` can run.

At this point we should have a pretty good idea of the sorts of arguments `createElement` takes. Let's see what TypeScript has to say about it.

## TypeScript

_The following type definitions are from [@types/react](https://www.npmjs.com/package/@types/react) v17.0.11_

`createElement` has 8 overloads, but for our purposes this version is the most relevant, since it handles custom function components:

```ts
function createElement<P extends {}>(
  type: FunctionComponent<P> | ComponentClass<P> | string,
  props?: (Attributes & P) | null,
  ...children: ReactNode[]
): ReactElement<P>;
```

The `P` generic type here corresponds to the _props_ of the given component, which defaults to an empty object if none are provided. But other than that, there should be no surprises here. This matches exactly what we observed earlier:

- The first argument can be a string or a reference to a custom React component
- The second argument is an object containing attributes and props
- The third argument handles children (gathered from additional args as necessary)

It could be very tempting at this point to see the `FunctionComponent` definition, and take that as the authority on how to type a component. But let's see what it really does:

```ts
interface FunctionComponent<P = {}> {
  (props: PropsWithChildren<P>, context?: any): ReactElement<any, any> | null;
  propTypes?: WeakValidationMap<P>;
  contextTypes?: ValidationMap<any>;
  defaultProps?: Partial<P>;
  displayName?: string;
}

type FC<P = {}> = FunctionComponent<P>;
```

I have a big issue with function type definitions that are both a function _and also_ take additional key-values. But I'll save that for another post. For now, though, it should be clear there is a lot of stuff in there you don't need and probably will never use. We could dive into each of these, but let's just focus on `PropsWithChildren`:

```ts
type PropsWithChildren<P> = P & { children?: ReactNode };
```

Remember that `P` is the type of props passed to our component, but in this type definition, an optional `children` parameter is added _whether you wanted it or not_.

In practice this silently ignores a particular bug which ought to be caught at compile time. To demonstrate this we just need a component that takes no children:

```ts
type GreetingProps = { name: string };
const Greeting: React.FC<GreetingProps> = ({ name }) => (
  <span>Hello {name}!</span>
);

// Then somewhere else in our app:
<Greeting name="rupert">good morning</Greeting>;
```

In this example we define a component taking a single string prop `name`, and then invoke it with the string `rupert` _but also_ pass the children string `good morning`. This is a mistake. Our component doesn't take or use children, and if I wrote this code I would want my IDE to tell me right away, but because we are using `React.FC` the _actual_ type of props our `Greeting` accepts has been broadened to:

```ts
{ name: string; children?: React.ReactNode }
```

So there's no compile time error. On the other hand if we simply didn't use `React.FC`:

```ts
type GreetingProps = { name: string };
const Greeting = ({ name }: GreetingProps) => <span>Hello {name}!</span>;

// Then somewhere else in our app:
<Greeting name="rupert">good morning</Greeting>;
```

In this case, TypeScript will correctly tell us we've made a mistake. That's a good thing. Errors should be loud and discovered at the first opportunity.

## Specific Children types

Hopefully, I've convinced you that if your component doesn't take children, you shouldn't use `React.FC`, but what if your component does take children? OK, well, what type of children does your component take?

The most common type for children is `ReactNode`. But if your component _has to take children_ shouldn't you enforce that? By explicitly typing your children in the props type you define, you get that enforcement by TypeScript.

I've also seen components that _must take_ multiple children, which we can type as `ReactNode[]`. In this case, it is a type error to pass only a single child. I think that's great!

Or what about a component that takes a callback as its child:

```ts
<AuthGuard>(readPermission, writePermission) => {
  // Custom render function based on user permissions
}</AuthGuard>
```

In this case, we can type children as

```ts
children: (readPermission: boolean, writePermission: boolean) => JSX.Element;
```

That's certainly something I want TypeScript to have tight control over.

## Default Prop handling

One final critique I'd like to make of using `React.FC` is how it forces us to type the function, rather than the inputs and outputs directly. This leads to some surprising behavior in the destructuring of default values:

```ts
type MessageProps = { message?: string };

// Here TypeScript correctly tells us that 'number' is not assignable to 'string'
const MessageWithoutReactFC = ({ message = 1 }: MessageProps) => {
  return <span>{message}</span>;
};

// However in this case it allows a mismatching default value
const MessageWithReactFC: React.FC<MessageProps> = ({ message = 2 }) => {
  return <span>{message}</span>;
};
```

TypeScript allows this in the `React.FC` case because it is implicitly defining a new type on the fly after the props object has been destructured. Inside the body of `MessageWithReactFC` the type of `message` is `string | number`. There is nothing _strictly_ wrong with this, but it is very surprising behavior.

## Return Types

It is up to you what your component returns, but naturally, it has to be something that React can render. _Most of the time_ the type `JSX.Element` is a good fit. Tailor this more specifically to your use case if possible.

## Summary

Your type system exists to tell you when you make a mistake. It should be strict enough to exclude all unwanted values, but not so strict as to exclude wanted values. Take the time to think carefully and intentionally about the types your component takes in and the types it puts out. `React.FC` is by design a very loose fit for very many kinds of components. We can and should be more specific.

- Don't use `React.FC`.
- Explicitly type your props _including permitted `children` types_.
- Prefer inferred return types, but `JSX.Element` if you have to.

Take care,

Rupert
