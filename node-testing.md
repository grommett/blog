---
date: '2023-07-07'
published: false
tags:
  - 'testing'
  - 'bundle-phobia'
---

# Unit Testing In Node

With Node 18 we _finally_ have a native [test runner](https://nodejs.dev/en/api/v18/test/) and that means **zero** dependencies. This is great news for organizations and repo owners who have to keep dependencies up-to-date and vulnerabilities at bay.

Below I'd like to explain why I'm switching to Node's native test runner and give some examples of what that transition might look like. I'm not going for breadth in the samples. This is more of a preview. For an in-depth walk through have a look at [Eric Windel's video](https://www.youtube.com/watch?v=2YfIB4gia60).

## Gratitude

Over the years the Node community has written several great test runner libraries: [Mocha](https://mochajs.org/), [Jest](https://jestjs.io/) and [Tap (my favorite)](https://node-tap.org/) to name a few.

While I'm thankful for the hard and smart work of the creators, maintainers and contributors of those libraries I'm happy (even excited) to make the move to using a standard library.

## Dependency Hell

The problem with the current state of testing in Node is the _enormous_ cost of transient dependencies. Go ahead, create an empty project and install Jest and checkout your `package-lock.json` file. This cost plays out in several ways:

1. **Developer Time**: Vulnerabilities. With each dependency the vulnerability surface increases. This means time spent hunting down where the problem is, upgrading if possible and then fixing any issues that occur as a result of the upgrade.
1. **Build Time**: For every dependency there's a request in the pipeline to install it. In turn, increasing the time spent waiting for the build to complete or deployment to finish.
1. **Complexity**: It's not true that for every dependency there's a new configuration to adjust, but without a native, standardized solution there can be a lof of configurations to tweak (and tweak).

## Onward!

The repo I'm primarily responsible for uses Jest as its test runner. I'll use that as my comparisons in common-use-case code samples below. I was pleasantly surprised to find that it's primarily small syntax changes.

> Again, if you're looking for an in-depth review have a look at the video linked at the beginning of this post.

### Set Up

Before we can run the tests there are a few minor things that need to change about how the test runner is executed and note that we are using `ESM` not `CommonJS` for our module type.

- **Module resolution**: If your code base is like ours you are most likely not specifying the file extension (`.js`) when you import relative files. By default Node uses `explicit` for its file resolution algorithm so we'll need to adjust that through flags to tell Node to resolve files the way they were previously resolved using [`--experimental-specifier-resolution=node`](https://nodejs.org/dist/latest-v18.x/docs/api/cli.html#--experimental-specifier-resolutionmode)
- **Babel Transforms**: If we're using `JSX` in your code you'll need to transpile the JSX to JavaScript prior to test execution. You can do that with an [ESM loader](https://nodejs.org/docs/latest-v18.x/api/esm.html#loaders).

### Describe/It

Node took into account common APIs from other testing libraries and included [`describe/it`](https://nodejs.dev/en/api/v18/test/#describeit-syntax) syntax. This API similarity will save a lot of git diffs when it's time to make the switch.

>Note that most samples in the Node documentation use `test` instead of `describe` and `it`.

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

So far we're just adding a few lines of code. Not bad. We've added two `imports` and modified our `expect` statement slightly. I am starting to wonder if a codemod would be easy enough to write.

### Mocking

Mocking is where the Node API and Jest API begin to drift some. I won't go over auto-mocking to keep things short and sweet, but auto-mocking is not built in like it is in Jest. I don't see this as a huge deal, but it will require more than a few simple API changes like `describe`/`it`

Let's see how the two differ by mocking a very common global like `fetch`.

---

**Jest**

```js
global.fetch = jest.fn();

fetch.mockImplementation((url) =>
  Promise.resolve({
    json() {
      return Promise.resolve({ value: `Hello from mocked fetch to ${url}` });
    },
  })
);

describe('Mock fetch', () => {
  it('returns an object with a value field representing the fetch url', async () => {
    const url = 'http://ops-dashboard';
    const result = await fetch(url);
    const actual = await result.json();
    const expected = { value: `Hello from mocked fetch to ${url}` };
    expect(actual).toEqual(expected);
  });
});
```

**Node Test Runner**

```js
import { mock, describe, it } from 'node:test';
import * as expect from 'node:assert';

global.fetch = mock.fn();

fetch.mock.mockImplementation((url) =>
  Promise.resolve({
    json() {
      return Promise.resolve({ value: `Hello from mocked fetch to ${url}` });
    },
  })
);

describe('Mock fetch', () => {
  it('returns an object with a value field representing the fetch url', async () => {
    const url = 'http://ops-dashboard';
    const result = await fetch(url);
    const actual = await result.json();
    const expected = { value: `Hello from mocked fetch to ${url}` };
    expect.deepStrictEqual(actual, expected);
  });
});
```

Like the previous example we added two `imports` and modified our `expect` statement slightly. This time we've added `mock` which is a top level object. The `mock` object is also available as a property of the test context as well. For example:

```js
describe('Mock usage', () => {
  it('tests something', async (t) => {
    const myMock = t.mock.fn();
    ...
  });
});
```

### Spies

Coming from Jest the spy set up is similar, but there are not yet convenient methods on spies. Below I've given two examples for both runners where we spy on a function and then spy on the method of an object.

**Jest**

```js
function spiedOnFunction() {}

const arithmetic = {
  add(a, b) {
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  },
};

describe('Spies', () => {
  it('spies on functions', (t) => {
    const spy = jest.fn(spiedOnFunction);
    const expected = 1;
    spy();
    expect(spy).toHaveBeenCalledTimes(expected);
  });

  it('spies on methods of objects', (t) => {
    const spy = jest.spyOn(arithmetic, 'add');
    const expected = 1;
    arithmetic.add(1, 2);
    expect(spy).toHaveBeenCalledTimes(expected);
    expect(spy).toHaveBeenCalledWith(1, 2);
  });
});
```

**Node Test Runner**

```js
import { describe, it } from 'node:test';
import * as expect from 'node:assert';

function spiedOnFunction() {}

const arithmetic = {
  add(a, b) {
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  },
};

describe('Spies', () => {
  it('spies on functions', (t) => {
    const spy = t.mock.fn(spiedOnFunction);
    const expected = 1;
    spy();
    const actual = spy.mock.calls.length;
    expect.strictEqual(actual, expected);
  });

  it('spies on methods of objects', (t) => {
    const spy = t.mock.method(arithmetic, 'add');
    const expected = 1;
    arithmetic.add(1, 2);
    const actual = spy.mock.calls.length;
    const calledWithArgs = spy.mock.calls[0].arguments;
    expect.strictEqual(actual, expected);
    expect.deepStrictEqual(calledWithArgs, [1, 2]);
  });
});
```

Reading through the code above we can see that Jest has a nicer interface for Spies, but Node's is not terrible. Like the other examples, we'll have to do some manual fixes or use a codemod, but the changes are not insurmountable.

I haven't written it, but I think we could probably create the same Spy interface using the Node test runner API, but that's another post all together. 

I hope this small preview helps you get your own codebase using Node's test runner. It'll be some work, but the amount of time spent transitioning will be a great investment towards future proofing against vulnerabilities, faster builds, faster test times and tons of transient dependencies.