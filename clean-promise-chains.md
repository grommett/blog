# Cleaning Up Promise Chains

## Promises are Monads

A monad, put simply, is a wrapper that contains a value and exposes methods to extract or insert a value. A Promise matches that definition pretty well. MDN says:

> A Promise is a proxy for a value not necessarily known when the promise is created

## Promises in the Wild

Promises were added to Javascript in 2012 and since then, and even before with [Bluebird](http://bluebirdjs.com/docs/getting-started.html) et al., I've seen them used in quite a few different ways. In my experience as a techinal lead I've had the pleasure to learn what, in my opion, is the best way to use them. By that I mean how do we create and use Promises in a scalable, testable and _readable_ way.

## Humans Read This Stuff

I often see Promise chains used with lambdas and some times this is totally ok. After all, lambdas forgoe the extra mental energy of thinking of a name, which is one of my favorite things. I prefer to expend my creative energy on the real task at hand, but this comes at a cost of readability, and even testability (or easier).

An example. Say we're getting data from an API and we wnat to do a small transform on that data. In the example below we'll average 3 data points:

```js
fetch('someurl')
  .then((response) => {
    return response.json();
  })
  .then((json) => {
    const { data1, data2, data3 } = json;
    return (data1 + data2 + data3) / 3;
  })
  .catch(console.error);
```

Now let's say the resonse contains some extra data and we also need to do some calculations on that. In addition to the average our users want to see the sum.

```js
fetch('someurl')
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
```

In order to test the average function we'll need to mock the global `fetch`...bummer. Getting the average is somethinh shouldn't require a mock, right? Let's fix that.

What if instead we
