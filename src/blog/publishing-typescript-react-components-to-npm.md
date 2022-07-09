---
title: Publishing TypeScript React components to NPM.
description: Publishing to NPM can be daunting at first. In this guide we'll make it quick and easy.
date: 2021-07-17
layout: layouts/post.njk
---
Key takeaways:

- compile to a `dist` directory
- copy `package.json` and `README.md` files to the `dist` directory
- publish the `dist` directory

If you get stuck or lost at any point during this guide, you can check out my demo repo here: [TypeScript Components by Rupert](https://github.com/fildon/typescript-components-by-rupert)

## Project setup

> If you already have a project that you just want to publish, feel free to skip this section, and scroll down to the next heading.

First, you need a name for your project, which isn't already in use on the npm registry.

For this guide, I'll use `typescript-components-by-rupert`. There isn't already an npm package with this name, which I can check by going to [https://www.npmjs.com/search?q=typescript-components-by-rupert](https://www.npmjs.com/search?q=typescript-components-by-rupert), and it shows me no exact matches.

> Disclaimer: If you do this search now, you will find an exact match for `typescript-components-by-rupert`, but it didn't exist before I wrote this guide 😀

Now go to GitHub and [create a new repo](https://github.com/new). Skip any options that add files for you. For this guide, I'll assume you are starting with an empty repository. Then clone it to your machine.

Inside the repo, run the following command to have npm create a `package.json` for you:

```shell
npm init -y
```

> You'll need to have npm installed globally for this work. If that's not already the case you can find instructions in [the npm docs](https://docs.npmjs.com/cli/v7/configuring-npm/install). For this guide, I am using npm version `7.10.0`.

Go ahead and take a look at the `package.json` it has created. There is a lot to talk about in here, but I'll save that for another post. The only thing you need to confirm right now is that the "name" entry has the name you chose for this project. If it doesn't match for any reason, go ahead and change it now. For example, mine says:

```json
"name": "typescript-components-by-rupert",
```

Next, add `TypeScript` and `React` to your project by running:

```shell
npm add -D typescript react react-dom @types/react
```

Now that you've added dependencies, you'll see a new `node_modules` directory has been added. We want `git` to ignore this directory, so add a `.gitignore` file with one line inside:

```shell
node_modules
```

Let's also add a `README.md`. For now, we can keep this light, but both `GitHub` and `npm` recognize this file as special and will render it to HTML as a kind of landing page for our project. It is important to maintain a guide in this file so that people who discover our project can get up to speed quickly.

And now let's write some React! For this guide, I'm going to stick to something very simple, a counter component. I'll create a new directory called `src` and add the following `counter.tsx` file:

```ts
import * as React from "react";

export function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </>
  );
}
```

> If you would like more guidance on writing React components in TypeScript you can see my post: [Seeing through JSX to understand React component Types](https://fildon.hashnode.dev/seeing-through-jsx-to-understand-react-component-types)

Lets also create an `index.ts`:

```ts
export { Counter } from "./counter";
```

This might not seem important right now when we only have one component, but if we want this repo to grow, having an index file acts as a kind of point of entry for all our exported components. It also streamlines how our components are imported by projects that depend on this repo, but we'll see that later.

## Build process

At this point your file structure should look like this:

```md
typescript-components-by-rupert/
├─ node_modules/
├─ src/
│  ├─ counter.tsx
│  └─ index.ts
├─ .gitignore
├─ package-lock.json
├─ package.json
└─ README.md
```

Since we are working with TypeScript we need to use `tsc` to compile our code. To do that we'll create a `tsconfig.json` at the root of the project:

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react",
    "declaration": true,
    "esModuleInterop": true,
    "outDir": "dist",
    "target": "es6",
    "module": "es6",
    "moduleResolution": "node"
  },
  "include": ["src"]
}
```

I won't dive into what each of these things means, but there are two that I ought to point out right now:

- `"declaration": true`
- `"outDir": "dist"`

The `declaration` option tells tsc whether we want to create `.d.ts` files while compiling our source code. This isn't always something you want. If you just want to compile TypeScript so that you can run the resulting JavaScript, you don't need this. But since we are intending to publish a library, `.d.ts` files are important to help provide type safety for projects that depend on our code.

The `outDir` option tells tsc where to put the files that it builds.

If you want to read up on the other options and tsconfig in general [here are the tsconfig docs](https://www.typescriptlang.org/tsconfig)

Now that we have a `tsconfig.json` we can write a build script.

Add this to the `scripts` section of the `package.json`:

```json
"clean": "rm -rf dist",
"build": "npm run clean && tsc && cp package.json README.md ./dist",
```

The `clean` command will fully delete the `dist` directory, which is useful for getting a completely new build each time.

The `build` command, begins by cleaning up any previous build output, then runs `tsc` (which will automatically use the `tsconfig.json` we just made), and then finally we copy the `package.json` and `README.md` files to the dist directory.

The reason we copy the `package.json` and `README.md` files into the dist directory, is that when we get to publishing this project, we want to publish the built files so that people can import and use our code immediately, but the npm CLI only allows publishing a directory that has a `package.json` in it. This is a common pain point, and I've seen many different approaches to dealing with this, but I think copying over just two files is the smoothest way I've seen to do it. With this approach, we maintain a clear separation between the source code we use for development vs the built code we publish for others to use.

We can now run this command on the terminal with just:

```shell
npm run build
```

This will create a 'dist' directory, with all the build output in it. This is another thing we'll want git to ignore. So go ahead and add another line to the `.gitignore` file, so that it now contains:

```shell
node_modules
dist
```

## Publishing

At this point your file structure should look like this:

```md
typescript-components-by-rupert/
├─ dist/
│  ├─ counter.d.ts
│  ├─ counter.js
│  ├─ index.d.ts
│  ├─ index.js
│  ├─ package.json
│  └─ README.md
├─ node_modules/
├─ src/
│  ├─ counter.tsx
│  └─ index.ts
├─ .gitignore
├─ tsconfig.json
├─ package-lock.json
├─ package.json
└─ README.md
```

We now have some lovely source code and a painless build process. But we haven't published anything yet!

> You'll need an npm account for the next part, so if you don't already have one, head over here: [Creating a new npm user account](https://docs.npmjs.com/creating-a-new-npm-user-account)

Once you have an account, you can log in on the terminal by running the following command and then enter your username and password when prompted:

```shell
npm login
```

Now we are ready to publish. This is your last chance to double-check that everything is the way you want it. _Once a version is published it can never be changed_. When you are ready:

```shell
npm publish ./dist
```

🎉 Hooray, you did it! 🎊

## Checking it works

Ok, but did it work? 😅

We can check quickly by going to the npm page for your package. For me that is at [https://www.npmjs.com/package/typescript-components-by-rupert](https://www.npmjs.com/package/typescript-components-by-rupert). Just change the last part of the URL to your package name to see if it is there already.

The ultimate test though is importing your package into another repository. If you have one available you should be able to run:

```shell
npm add typescript-components-by-rupert
```

And then in any JS or TS file import your component:

```ts
import { Counter } from "typescript-components-by-rupert";
```

## The Future

This is just the start. Now that you have a build and publishing process, you can go ahead and add all sorts of new components and features to your library. Each time you want to publish your new work, you need to do so as a new version. The current version is listed in your `package.json`. Ideally, you should stick to [semantic versioning](https://semver.org/), although not everyone does. TypeScript for example doesn't use semantic versioning!

If you are looking for inspiration on what to add next, I highly recommend each and all of the following:

- [Jest](https://jestjs.io/) for unit testing
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) to make testing components easy
- [ESLint](https://eslint.org/) for linting
- [Storybook](https://storybook.js.org/) for running components in isolation

## Summary

- compile to a `dist` directory
- copy over `package.json` and `README.md` files to the `dist` directory
- publish the `dist` directory

Take care,

Rupert
