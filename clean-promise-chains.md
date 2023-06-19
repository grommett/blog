---
date: '2023-06-16'
tags:
  - 'promise'
  - 'clean code'
---

# Cleaning Up Promise Chains

MDN says:

> A Promise is a proxy for a value not necessarily known when the promise is created.

I know that now nowadays `await` is used more frequently, but remember behind every `await` is a Promise. `await` is just nice abstraction over a Promise that fits our mental model better. There is still a really strong case for Promises, especially if you need multiple asynchronous operations executing in parallel.

## Promises in the Wild

Promises were added to Javascript in 2012 and since then, and even before with [Bluebird](http://bluebirdjs.com/docs/getting-started.html) et al., I've seen them used in quite a few different ways. In my experience as a techinal lead I've had the pleasure to learn, in my opion, the best way to create them so that they are scalable, testable and _readable_.

## Humans Read This Stuff

I often see Promise chains used with lambdas and some times this is totally ok. After all, lambdas forgo the extra mental energy of thinking of a name and I love that. I prefer to expend my creative energy on the real task at hand, but this can come at a cost of readability, and even testability.

## Some Examples

Say we're getting data from an API and we want to do a small transform on that data. In the example below we'll average 3 data points:

```js
function getData() {
  return fetch('someurl')
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      const { data1, data2, data3 } = json;
      return (data1 + data2 + data3) / 3;
    })
    .catch(console.error); // This is foreshadowing :)
}
```

Now let's say, in addition to the average, our users want to see the sum.

```js
function getData() {
  return fetch('someurl')
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      const { data1, data2, data3 } = json;
      const sum = data1 + data2 + data3;
      const average = sum / 3;
      return { average, sum };
    })
    .catch(console.error);
}
```

So far not _*so*_ bad, but you can see that this anonymous function is starting to grow and it's wrapped in all the Promise noise. Plus it's got some error handling and, oh yeah, it's kicked off by a request (`fetch`) too.

Let's go one step further and make this [columnar data](https://github.com/leeoniya/uPlot/tree/master/docs#data-format) so we can put it on a graph. Just one point for `sum` and one point for `average`. To do this we'll add another function to the chain.

```js
function getData() {
  return fetch('someurl')
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      const { data1, data2, data3 } = json;
      const sum = data1 + data2 + data3;
      const average = sum / 3;
      return { average, sum };
    })
    .then((calculations) => {
      const { average, sum } = calculations;
      const isoDate = new Date().toISOString();
      return [[isoDate], [average], [sum]];
    })
    .catch(console.error);
}
```

This is really starting to get noisy and more transforms will just add to that. Believe me when I say the next developer **WILL** just add to this chain! Additionally, it's hard to break this out into smaller unit tests. You'll have to run `getData` and `await` + `try/catch` before you even know if each anonymous function does what it claims. Additionally, before we can even test we'll need to mock `fetch`. 🤕

## There's a Better Way

Let's clean this mess up so that there's less noise, we can test it (more easily) and we can scale it out and maintain readability.

First let's give each anonymous function a name and pull it out of the chain.

```js
/**
 * This might be overboard, but we can add better error handling in here
 * without muddling the promise chain. Yes, response.json will throw anyway
 */
function responseToJson(response) {
  try {
    // This little line right here has caused me SO much heartache. Always handle malformed json!
    return response.json();
  } catch (error) {
    throw new Error('Could not parse json');
  }
}

function transformData(data) {
  const { data1, data2, data3 } = json;
  const sum = data1 + data2 + data3;
  const average = sum / 3;
  return { average, sum };
}

function dataToColumnar(data) {
  const { average, sum } = calculations;
  const isoDate = new Date().toISOString();
  return [[isoDate], [average], [sum]];
}
```

Now that we've got the core logic outside of the Promise chain we can use it anywhere - not just in the Promise. Plus this will be a lot easier to test.

Now for a readable, scalable Promise chain. Notice how it reads really well! It almost tells the story entirely. Also note that if we need to add another transform we can easily add it here without more noise.

```js
function getData() {
  return fetch('someurl')
    .then(responseToJson)
    .then(transformData)
    .then(dataToColumnar)
    .catch(console.error);
}
```

## Side Note

> Using functions in this way is called [tacit programming](https://en.wikipedia.org/wiki/Tacit_programming). If you like functional programming, or even interested in the idea, have a look at the link.
> In the code above we've made this much more declarative and scalable. I know it's subjective, but I think it reads much nicer too.

I realize that this solution may cause some indirection, but the readability is worth it, especially since most code editors allow you to jump to functions anyway.

In summary, where possible move your logic out of lambdas and into named functions so that you can test your assumptions outside of the Promise. You may find that you have variable scope issues with this approach. I'll cover that in another post.
