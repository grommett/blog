---
date: '2023-08-11'
tags:
  - 'electron'
  - 'docker'
  - 'docker engine api'
---
# The Docker Engine API and Electron

Recently, my team was asked to remove Docker Desktop, an [Electron](https://www.electronjs.org/) app, from our machines due to licensing issues. I used Docker Desktop all the time. The GUI was nice and since it was always running I could just <kbd>command</kbd> + <kbd>tab</kbd> to see what containers were running or what images I'd pulled recently. I never used it for deep details, just the very basics. Start, stop and cleaning up unused images and containers.

## How Hard Could It Be?

After uninstalling Docker Desktop and switching to [Colima](https://github.com/abiosoft/colima), having to switch to the terminal to `list`, `start` and `stop` I longed for the GUI. The problem was there's no official Colima GUI. Or I couldn't find one, anyway. So I decided, for _my_ very small use cases, maybe I could build this thing? A several-weekend project ensued and I'm still not done, but I'd like to share findings so far with some basic code samples.

The recipe is simple:

1. An API ✅ - thanks Docker!
1. A service to talk to the API (Electron + Node)
1. A frontend to display it (Electron + HTML)

## The Docker Engine API

If you've got Colima installed you've got access to the Docker Engine API and there are a lot of things you can do with it. Pretty much everything I ever use Docker Desktop for plus much, much more.

## Accessing The API

The [Docker Engine API](https://docs.docker.com/engine/api/) is available through a [unix socket](https://en.wikipedia.org/wiki/Unix_domain_socket). One thing to note is that the location of the socket and it's permissions can be configured. In the examples that follow I'm using the default socket created by Colima. If you've changed your socket in anyway, naturally you'll need to adjust.

To preview this API let's get a list of containers using `curl` (note that the domain `docker` can be any name):

`curl --unix-socket ${HOME}/.colima/docker.sock  http://docker/containers/json?all=true`

If you have at least one container running you should have received a `json` list of containers.

The same can be done with images (and any other resource):

`curl --unix-socket ${HOME}/.colima/docker.sock  http://docker/images/json`

## The Basics Of A Docker Node Service

`curl` is nice to see how things work and to tinker around, but to get this into an Electron app we're going to need to use Node. Turns out that's pretty simple too and there's actually a [library](https://www.npmjs.com/package/dockerode) out there that will do all this for you, but how fun is that? To be honest, I felt like for what I wanted to do `dockerode` was overkill. With that, let's look at an example doing it ourself:

```js
// At the time of this writing Electron does not support ESM

const { homedir } = require('os');
const http = require('http');
const options = {
  socketPath: `${homedir()}/.colima/docker.sock`,
  path: '/containers/json?all=true',
  method: 'GET',
};

function callback(res) {
  console.log(`status: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (data) => console.log(data));
  res.on('end', (data) => console.log('ended ', data));
  res.on('error', (data) => console.error(data));
}

const clientRequest = http.request(options, callback);
clientRequest.end();
```

That's it. The path is hardcoded for the sake of simplicity, but you can see that this could be abstracted pretty easily and promisified. With the sample above we've got the beginnings of a service that can talk to Docker.

Below, I'm going to go through a very basic set up of how to get these pieces wired up together in Electron. Some of the content is modified from the already [great tutorial](https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app) on the Electron site.

## Electron

> Build cross-platform desktop apps with JavaScript, HTML, and CSS.

[Electron](https://www.electronjs.org/docs/latest/) is a great technology that allows you to build a UI with HTML, CSS and JavaScript with access to Node and OS APIs. Check the docs at the link above for all the details. You can think of Electron as a technology that wraps Chrome and Node into an application. From a very high level our Electron app will be made up of:

- Chrome for rendering the UI
- Node for accessing the Docker Engine API
- A context bridge that facilitates communication between the frontend and the system.

<image src="./imgs/electron-diagram.png"/>

### Dependencies & Set Up

Let's start with a bare minimum set up and install:

```
mkdir my-docker-electron
cd my-docker-electron
npm init -y
npm install electron
```

In `package.json` add the start script:

```
"start": "electron ."
```

This is all the set up and dependencies we'll need to get a sample up and running. Of course, for the UI there are tons of framework options, but a little JavaScript, HTML & CSS can go a really long way.

In the code samples that follow we'll work through each of the necessary pieces and in the last file we'll tie everything together.

### The UI

I'm going start with a basic html file that we can load into the app:

```html
<!-- pages/index.html  -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <!-- Electron warns when there is no CSP -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <meta
      http-equiv="X-Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <title>Docker Electron!</title>
  </head>
  <body>
    <h1>Docker Electron!</h1>
    <p>🐳</p>
    <button>Click for a list of containers</button>
    <script>
      // this will be explained further down
      electronAPI.dockerService.getContainers().then((containers) => {
        console.log(containers);
      });
    </script>
  </body>
</html>
```

### Context Bridge

The context bridge is middle element between the UI and Node. It facilitates passing messages between the two. We'll get to that further down.

Let's look at what the context bridge contains.

```js
// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  dockerService: {
    getImages() {
      return new Promise((resolve, reject) => {
        ipcRenderer
          .invoke('docker:getImages')
          .then((result) => {
            resolve(result);
          })
          .catch((error) => {
            console.log('error in bridge ', error);
            reject(error);
          });
      });
    },
    getContainers() {
      return new Promise((resolve, reject) => {
        ipcRenderer
          .invoke('docker:getContainers')
          .then((result) => {
            resolve(result);
          })
          .catch((error) => {
            console.log('error in bridge ', error);
            reject(error);
          });
      });
    },
  },
});
```

In the code above we're doing two things. We are exposing methods to the UI and calling methods in our Node backend (via the main process).

Above we're using the context bridge to expose methods to the UI through the `contextBridge.exposeInMainWorld` function. This function exposes a global object to the UI called `electronAPI` that has a property called `dockerService`. After the context bridge is created and the UI has loaded, the JavaScript in the UI can access the docker api by calling methods exposed by this global. For example, if we wanted to get a list of containers and render them in UI we'd call `electronAPI.dockerService.getImages()`.

The `ipcRenderer` is the component that facilitates a connection to our main process and our main process, based on the `invoke` parameter, then calls the Node service.

### Node Docker Service

The Node service should look very familiar if you've programmed in Javascript. This and the HTML file are fairly straightforward.

```js
// docker-service.js

const { homedir } = require('os');
const DockerSocket = require('./docker-socket');
const { normalizeContainerList } = require('./normalize-containers.js');
const userHomeDir = homedir();
const socketPath = `${userHomeDir}/.colima/docker.sock`;
const docker = new DockerSocket(socketPath);

const dockerService = {
  getImages() {
    return docker.fetch('/images/json');
  },
  getContainers() {
    return docker.fetch('/containers/json?all=true');
  },
};

module.exports = dockerService;
```

Above we have a simple Node service. The `DockerSocket` class is an abstraction of the simple Node service I wrote in the beginning of this post, except I've `promisified` the `http.Request`. I won't go into the details of that since the goal is to show how things are wired together.

### Main

Finally, let's wire this all together.

`main.js` is our application entry point and it's where we tie together the UI, the context bridge and the Node service that talks to the Docker Engine API.

```js
// main.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dockerService = require('./backend/docker-service');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, './backend/preload.js'),
    },
  });
  dockerService.events(win);
  // This is the html file defined above that will represent the UI
  return win.loadFile('./src/frontend/pages/index.html');
}

app.whenReady().then(() => {
  // These are the events the main thread is listening for
  ipcMain.handle('docker:getImages', dockerService.getImages);
  ipcMain.handle('docker:getContainers', dockerService.getContainers);
  createWindow();
});
```

Let's walk through the code above.

When the app is ready we do two things:

- Listen for events from the context bridge (scroll up and have a look at the context bridge and HTML sections again)
- Create the window the HTML will be rendered in

## Summary
In the sections above we talked about the Docker engine exposing an API and walked through some basic code samples to display that information in an Electron app. I think with the combination of these two elements it would be relatively simple to get a decent, simplified version of Docker Desktop.


