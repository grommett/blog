---
date: '2023-07-07'
published: false
tags:
  - 'testing'
---
# Unit Testing In Node

With Node 18 we _finally_ have a native [test runner](https://nodejs.dev/en/api/v18/test/) and that means **zero** dependencies. This is great news for organizations and repo owners who have to keep dependencies up-to-date and vulnerabilities at bay.

Below I'd like to explain why I'm switching to Node's native test runner and give some examples of what that transition might look like. I'm not going for breadth in the samples. More of a preview. Everyone has their favorite ways of testing. For a more in-depth walk through have a look at [Eric Windel's video](https://www.youtube.com/watch?v=2YfIB4gia60).

## Gratitude

Over the years the Node community has written several great test runner libraries: [Mocha](https://mochajs.org/), [Jest](https://jestjs.io/) and [Tap (my favorite)](https://node-tap.org/) to name a few.

While I'm thankful for the hard and smart work of the creators, maintainers and contributors of those libraries I'm happy (and excited) to make the move to using a standard library.

## Dependency Hell

The problem with the current state of testing in Node is the _enormous_ cost of transient dependencies. Go ahead, create an empty project and install Jest and checkout your `package-lock.json` file. This cost plays out in several ways:

1. **Developer Time**: Vulnerabilities. With each dependency the vulnerability surface increases. This means time spent hunting down where the problem is, upgrading if possible and then fixing any issues that occur in the process.
1. **Build Time**: For every dependency there's a request in the pipeline to install it. In turn, increasing the time spent waiting for the build to complete or deployment to finish.
1. **Complexity**: It's not true that for every dependency there's a new configuration to adjust, but without a native, standardized solution there can be a lof of configurations to tweak (and tweak).

## Onward!

The repo I'm primarily responsible for uses Jest as its test runner and is built using React for the frontend. I'll use those in the set up and high-level, common use case code samples below. I was pleasantly surprised to find that, for the most part, it's mainly small syntax changes.

>Again, if you're looking for an in-depth review have a look at the video linked at the beginning of this post.

### Set Up

Before we can run the tests there are a few minor things that need to change about how the test runner is executed. 
- **Module resolution**: If your code base is like ours you are not setting the file extensions (`.js`) when you import them. By default Node uses `explicit` for its file resolution algorithm so we'll need to adjust that through flags to tell Node to resolve files the way they were previously resolved using [`--experimental-specifier-resolution=node`](https://nodejs.org/dist/latest-v18.x/docs/api/cli.html#--experimental-specifier-resolutionmode)
- **Babel Transforms**: Since we're using `JSX` in our code we'll need to transpile the JSX to JavaScript prior to test execution. We can do that with an [ESM loader](https://nodejs.org/docs/latest-v18.x/api/esm.html#loaders). 
### Describe/It

Fortunately, Node took into account very common use cases from other testing libraries and included [`describe/it`](https://nodejs.dev/en/api/v18/test/#describeit-syntax) syntax. This API similarity will save a lot of git diffs when it comes time to switch over.

Lets see an example with Jest and Node:

---

**Jest**
```js
function add(a, b) {
  return a + b;
}

describe('add', () => {
  it('returns the value of two numbers added together', () => {
    const actual = add(2, 2);
    const expected = 4;
    expect(actual).toEqual(expected);
  });
});
```

**Node Test Runner**
```js
import { describe, it } from 'node:test';
import * as expect from 'node:assert';

function add(a, b) {
  return a + b;
}

describe('add', () => {
  it('returns the value of two numbers added together', () => {
    const actual = add(2, 2);
    const expected = 4;
    expect.strictEqual(actual, expected);
  });
});
```
What we're doing above looks similar to Jest with some notable, but minor differences:
- `describe` and `it` must be imported. Unlike Jest, these are not globals. Additionally, we have to `import` all test runner methods with the `node:` schema, `'node:test'`. Just importing `test` will not work.
- We can alias the `assert` import to `expect` which is what Jest uses for assertions and get pretty far.

So far this is just adding a few lines of code. Not bad. We've added two `imports` and modified our `expect` statement slightly. I am starting to wonder if a codemod would be easy enough to write.

### Mocking
Mocking i

## Not Invented Here <sup>[\*](#notes)</sup>

I'll be honest. I don't like [Jest](https://jestjs.io/). I never have. It offers nothing new other than the fact that it was made at Facebook.

I actually thought (and still do) that [Mocha](https://mochajs.org/) did everything one could ask for. Its focus is one thing. Run tests. With that core idea you can plugin your own [assertion](https://www.chaijs.com/) and [mocks/stubs/spies](https://sinonjs.org/) libraries. Or not. You could even use Node's built-in [assertion](https://nodejs.org/docs/latest-v18.x/api/assert.html) library (all the way back to version 2!) if you wanted for simple things.

One thing about Jest is that even after four versions

---

#### Notes

1. [Not invented here syndrome](https://en.wikipedia.org/wiki/Not_invented_here)
