---
date: '2023-06-16'
---
# Server Sent Events
Server Sent Events are a part of the [HTML 5 spec](https://html.spec.whatwg.org/dev/server-sent-events.html). They're an old, but amazing technology that's not used often enough for web apps that need one-way, real-time updates. If you need two-way communication then web sockets are a better fit.

Server sent events are easy to implement on the server and extremely easy to handle on the front end. In fact, on the front end you handle them just like you'd handle a click event. How simple is that?

In this post my intent is to describe the usage of this technology with some code samples. My hope is that the next time you think of polling or using web sockets you also consider server sent events.

## Real World Use Case

In our application we allow users to create an architectural diagram of how an account's IBM Cloud resources fit together. To create this diagram requires that we gather their resources, do some transformations on them and then send them to a service that generates an xml Draw.io file. This can be a long running process so we'd like to give our users feedback along the way. Here's how that process works:

1. Query our API for about ~15 different resources and wait for all the results
1. After all of the results have arrived we build up an object that creates relationships among the resources
1. Send the result of step two to another server that parses the object and builds a nice architecture diagram in Draw.io format (xml)
1. Send the diagram back to the user

Steps one and three may take some time and during those processes we can give our users feedback. We do that with an "onStatus" event. This event simply reports `Downloading resources` and `Creating diagram` to the UI. Naturally, there is also error handling and a few others, but we'll focus on the `onStatus` event for simplicity.

## Overview
As you'd imagine you need two pieces to put this puzzle together:

- A server that emits events
- A UI that listens for events
## Backend
### Server Sent Events

First we need a server that's going to send events. In order to do that when a request is received our server needs to respond with the correct headers to let the client know that we're going to keep the connection alive and we're going to send some events. For the example, below we'll just allow the connection to stay open, but we won't send any events yet.

```js
function sseRouteHandler(_req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
  });
}
```
  
That's fairly simple. Above we're just saying hey client/browser we're going to keep this connection open and you can expect content that is text **_and_** in the shape of an `event-stream`. 

So what is an event-stream? Generally speaking, it's a block of text with two new lines that separates each event. Each line in the block of text first specifies the field and the the value of that field. Sound familiar? 

For a real deep dive have a look at [MDN's examples](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events). For now we'll keep it simple and use an example to clarify. 

```js
function sseRouteHandler(_req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
  });

  res.write(`
    event: onStatus
    data: Downloading resources
  `);
}
```
  
Above we're doing what we did before, but now we're also sending one event. As you can see we're specifying:

- **Name** of the event: `event: onStatus`
- **Value**: `data: Downloading resources`

This is really easy! Nothing too crazy or esoteric about it. Just a block of text that almost looks like yaml, but it's not.

Next we'll send two events. The key thing to notice is that since this is a stream of data we need to separate events from each other. We do that by adding an extra line return between events.

```js
function sseRouteHandler(_req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
  });

  res.write(`
    event: onStatus
    data: Downloading resources

    event: onStatus
    data: Creating diagram
  `);
}
```
  
In the code sample above we're now sending two events separated by an empty line. This will cause the client who's listening to differentiate between the two. So now the server is saying:

- Here's a status event. We're downloading resources
- Here's a status event. We're creating a diagram

Now that we've got a backend emitting events let's move on to the frontend.

## Front End
### The Event Source API

[MDN says](https://developer.mozilla.org/en-US/docs/Web/API/EventSource):
>The EventSource interface is web content's interface to server-sent events. 

>An EventSource instance opens a persistent connection to an HTTP server, which sends events in text/event-stream format. The connection remains open until closed by calling EventSource.close().

The browser's doing the heavy lifting for us here. Since the server response stays open the browsers going to emit events each time new data is sent through the request connection. That's it. Really. Checkout the code sample below to see a barebones set up.

```js
// The url to a server that emits events
const eventSource = new EventSource('/sse');

eventSource.addEventListener('onmessage', () => {
  // do magical things 🧙🪄
})
```
  
The code above will react to any message that is sent through the event source (the server), but you'll probably have specific events you'd like to respond to.

Below is the front end code where we listen to server events emitted from the server. The `onStatus` emits different statuses (`Download resources`, `Creating diagram`) as mentioned above.  Since this is a React app those state changes trigger UI updates.

```js
// Update the UI as we get different statuses in the process
source.addEventListener('onStatus', event => {
  this.setState({ status: event.data });
});
// Handle any errors
source.addEventListener('onError', event => {
  this.setState({ 
    exportStatus: EXPORT_STATUS.ERROR, 
    status: event.data 
  });
  source.close();
});
```
  
That's it. These are barebones code samples and resources to get you started. The next time you need real-time data in addition to web sockets or polling include Server Sent Events in your assessment.