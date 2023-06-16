# Cleaning Up Promise Chains

MDN says:

> A Promise is a proxy for a value not necessarily known when the promise is created.

## Promises in the Wild

Promises were added to Javascript in 2012 and since then, and even before with [Bluebird](http://bluebirdjs.com/docs/getting-started.html) et al., I've seen them used in quite a few different ways. In my experience as a techinal lead I've had the pleasure to learn what, in my opion, is the best way to use them so that they are scalable, testable and _readable_.

## Humans Read This Stuff

I often see Promise chains used with lambdas and some times this is totally ok. After all, lambdas forgoe the extra mental energy of thinking of a name, which is one of my favorite things. I prefer to expend my creative energy on the real task at hand, but this comes at a cost of readability, and even testability (or easier).

An example. Say we're getting data from an API and we want to do a small transform on that data. In the example below we'll average 3 data points:

```js
funcion getData() {
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
funcion getData() {
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

So far not _*so*_ bad, but you can see that this anonymous function is starting to grow and it's wrapped in all the Promise noise. Plus it's got some error handling and, oh yeah, it's kicked off by a request.

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

This is really starting to get noisy and more transforms will just add to that. Believe me when I say the next developer **WILL** just add to this chain! Additonally, it's hard to break this out into smaller unit tests. You'll have to run `getData` and `await` + `try/catch` before you even know if each anonymous function does what it claims. Additonally, before we can even test we'll need to mock `fetch`. 🤕

## There's a Better Way

Let's clean this mess up so that there's less noise and we can scale it out and maintain readability.

First let's give each anonymous function a name and pull it out of the chain.

```js
/**
 * This might be overboard, but we can add better error handling in here
 * without muddling the promise chain
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

Now for a readable, scalable Promise chain. Notice how it reads really well! Also note that if we need to add another transform we can easily add it here without more noise.
```js
function getData() {
  return fetch('someurl')
    .then(responseToJson)
    .then(transformData)
    .then(dataToColumnar)
    .catch(console.error);
}
```
We've made this much more declarative and scalable. The next dev who comes along is much less likely to jam more logic into an already complex, long 