# React Microfrontends

An un-opinionated implementation of microfrontends in React.

- Build, maintain, and deploy pieces of your application independently.
- Share global dependencies.
- Develop the way you want to with a nearly transparent API.
- No crazy polyfills or bleeding edge tech required.

## Why Microfrontends?

Microfrontends do for the client what Microservices have done for the backend. They allow you to build, maintain, and deploy a logical portion of your application separate from other pieces. This allows teams to move quickly and independently and prevent you application from becoming a gigantic bloated monolith that is hard to work on. If you've landed here, it's either because you have heard the buzz word, or you're actually experiencing the pain with your own monolithic frontend.

![Microfrontends](https://github.com/big-squid/react-microfe/raw/master/microfrontends.png "Microfrontends")

## Other solutions
- Single SPA: This solution is more of a framework that provides ways to run multiple front end languages and uses System.js for dynamic runtime importing. If you want to make a franken app of React, Vue, and Angular, this project might be for you. https://github.com/CanopyTax/single-spa
- Web components: This involves exporting your microfrontend as a standalone web component. This solution is viable for shipping microfrontends, but browser support is still limited and requires heavy polyfilling. All of the standard limitations of web components apply. 
- Installable React components: This involves publishing your microfrontend as an installable React component. The build and maintenance portion of doing this would be nearly identical to using `react-microfe`, but the downside is that deployments will require going back to the main app shim, revving a version, installing the package, doing a build, and re-deploying the main app.
- iFrames: This involves the main app shim loading up content from different domains using iFrames. These win for being the easiest to setup and maintain, but they're terrible for  performance, have varying security rules across browsers, and have an automatic "ick" factor associated with most devs.

## How react-microfe works

`react-microfe` wraps a component at build time in a way that allows it to be imported dynamically into your main React app shim. You can think of it like webpack's dynamic import syntax except it works across domains instead of in your local codebase. Additionally it exposes a way to declare shared libraries and provide runtime configuration for your microfrontend. It makes very few assumptions about the structure of your code or how you will deploy your application. It also doesn't require any advanced polyfills or specific browser support. It works out of the box with `React.Lazy` and `React.Suspense`, so usage should be familiar to anyone that has used those APIs. A quick example:

```jsx
import React from 'react'
import { importMicrofrontend } from 'react-microfe';

const MyRemoteFrontend = React.lazy(() =>
  importMicrofrontend('https://my.example.com/myfrontend.js');
);

function App() {
  return (
    <React.Suspense fallback={<div>Loading</div>}>
      <MyRemoteFrontend/>
    </React.Suspense>
  )
}
```

## Getting Started

### Installation and Setup
Intall using NPM or Yarn

`npm i react-microfe` or `yarn add react-microfe`

This setup guide will walk you through the following:
- Building your frontend
- Packaging and deploying your frontend
- Importing your microfrontend into your main shim app
- Handling runtime configuration
- Advanced Topics

### Building Frontends
`react-microfe` works well with `create-react-app` out of the box. You are free to build with any tools you wish but Webpack is the recommended build system to make this "just work". There is just a minor congnitave and structural change you may have to make when developing your microfrontends codebase.

A typical Hello World React example usually has you place things like Providers, Routers, and other setup components at the root index.js of your app.

```jsx
// A typical CRA example. DON'T do this for react-microfe
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './mystore';
import App from './App';
import './index.css';

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
```
```jsx
// src/app.js
import React from 'react';

export default function App() {
  return <div>Hello World</div>
}
```

The above wont work for our microfrontend because we want the providers to be part of the exported App component. The only thing that needs to change in the above example is that ReduxProviders, Routers, and any other global providers should be available as part of your app.js files default export. Also keep in mind what styles you do and don't want to come along with your microfrontend.

```jsx
// A modified example for react-microfe. DO THIS!
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
// this should only include the minimal stuff to setup the container for your app in development.
// Things like styles for the body, html or #root element.
// this should NOT contain any styling for the microfrontend itself.
import './index.css'; 

ReactDOM.render(<App />, document.getElementById('root'));
```
```jsx
// src/app.js
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './mystore';

function App() {
  return <div>Hello World</div>
}

// Our default export now contains our app, and our providers
export default function() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
}
```

Thats really the only change you'll have to make to your development setup! Building a microfrontend still requires some additional thought in regards to dependencies, styling, and configuration. It will be injected along side of another app that already has things like styles, polyfills, global variables, local and session storage items, workers, and many other things that you're probably used to only thinking about in a single context.

## Packaging and Deployment

If you used `create-react-app` for your frontend, packing should be quick and easy.

- In the root of your project, create a new file `microfe.config.js`.
- Add the following content to that file
  ```js
  const { patchWebpackConfig } = require('react-microfe');
  const craConfig = require('react-scripts/config/webpack.config');
  const path = require('path');

  module.exports = patchWebpackConfig({
    name: 'myfrontend',
    config: craConfig('development'),
    // This is important! Point entry to wherever your main App components default export is.
    entry: path.resolve(__dirname, './src/App.js')
  });
  ```
- From the root of your project, use the webpack cli to run your build. `npx` is a great tool for calling binaries present inside of your node_modules folder. If you have webpack installed globally, you can omit `npx`.
  ```
  export NODE_ENV=production && npx webpack --config microfe.config.js
  ```
- You should now have a file in the `dist` or `build` directory called `myfrontend`, or whatever you named yours.

Your `myfrontend.js` file should be completely self contained and have everything needed to run your microfrontend. You can now host this file on the server or CDN of your choice. You can see the `apps/test-remote` directory for a working example using `create-react-app`. The above example should work with a custom webpack config as well, just import your webpack config instead of CRA's. See "Advanced Topics" for strategies to build your app with something other than webpack.

## Importing your Microfrontend

Now that your microfrontend is deployed somewhere, we can import it into the main application. If you have an existing project, the "main" application is your monolith. If you're starting from scratch, the main application should be a shell that might have some global navigation and routing in it.

Before we continue though, we need to expose React and ReactDOM as a shared dependency so that our microfrontend will have access to it when it loads. React complains loudly if it finds multiple copies of itself in the DOM, so this setup is required. This is done easily using the `declareExternals` function.

```jsx
// in the index.js file of your main / app shim
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { declareExternals } from 'react-microfe';

declareExternals({
  React,
  ReactDOM
});

ReactDOM.render(<App />, document.getElementById('root'));
```

The same function is used to declare other shared dependencies if you have them which is addressed in the "Advanced Topics" section below. At a minimum, React and ReactDOM are always required.

No we can simply use the `React.lazy` and `React.Suspense` apis with the `importMicrofrontend` function. You should see your remote microfrontend load and mount like any other React component.

```jsx
import React from 'react';
import { importMicrofrontend } from 'react-microfe';

const MyRemoteFrontend = React.lazy(() =>
  importMicrofrontend('https://my.example.com/myfrontend.js');
);

function App() {
  return (
    <React.Suspense fallback={<div>Loading</div>}>
      <MyRemoteFrontend/>
    </React.Suspense>
  )
}
```

## Configuration

There are many ways to handle configuration when deploying, often referred as environment variables. Things like your api url, browser based api keys, or feature flags are all examples of configuration. These configuration variables generally vary between environments, i.e. an api url for your dev environment vs production: https://dev.myapi.com vs  https://prod.myapi.com.

If you're using `create-react-app` or `webpack` you might be familiar with using a .env file and accessing variables in your code using `process.env`. When you run a build of your application, webpack actually replaces anywhere that says `process.env` with a hardcoded javascript object. This makes makes your built file static and not very configurable. If you've ever deployed a frontend application, you're likely already aware of this. While you are free to roll your own configuration management, `react-microfe` includes some bare essentials so that it can just work out of the box.

### Specifying Configuration

`react-microfe` works with both local and remote configuration. Configuration should be specified or passed through the main app shim.

For local configuration, you can pass any values to the `env` parameter when importing your frontend. This can be any valid javascript code, but it is recommended you keep configuration variables to primitives like strings, numbers, and booleans.

```jsx
// In your main app shim
const MyRemoteFrontend = React.lazy(() =>
  importMicrofrontend({
    url: 'https://my.example.com/myfrontend.js',
    env: {
      API_URL: 'https://my.example.com/api/v1/',
      ENABLE_NEW_USER_FLOW: true
    }
  });
);
```

For remote configuration, specify an endpoint that returns a JSON object. CORS MUST BE HANDLED PROPERLY if you are calling across domains. Any remote configuration will be loaded before the import is finished so you can guarantee it will be present when the component mounts.

```jsx
// In your main app shim
/**
 * Remote env. Response for https://my.example.com/my-remote-config.js should be valid JSON like:
 * {"API_URL": "https://my.example.com/myfrontend.js"}
 */
const MyRemoteFrontend = React.lazy(() =>
  importMicrofrontend({
    url: 'https://my.example.com/myfrontend.js',
    remoteEnv: 'https://my.example.com/my-remote-config.json'
  });
);
```

You can use both remote and local configuration. Matching items from the remote environment will override anything specified in the local one.

```jsx
// In your main app shim
const MyRemoteFrontend = React.lazy(() =>
  importMicrofrontend({
    url: 'https://my.example.com/myfrontend.js',
    remoteEnv: 'https://my.example.com/my-remote-config.json',
    env: {
      API_URL: 'https://my.example.com/api/v1/',
      ENABLE_NEW_USER_FLOW: true
    }
  });
);
```

Lastly, it's important to note that we're dealing with plain old React components. It is recommended you keep the props surface for your microfrontend as minimal as possible, but you can absolutely pass props related to configuration into your component.

```jsx
// In your main app shim
import React from 'react';
import { importMicrofrontend } from 'react-microfe';

const MyRemoteFrontend = React.lazy(() =>
  importMicrofrontend('https://my.example.com/myfrontend.js');
);

function App() {
  return (
    <React.Suspense fallback={<div>Loading</div>}>
      <MyRemoteFrontend apiUrl="https://my.example.com/api/v1/"/>
    </React.Suspense>
  )
}
```

### Reading Configuration

To read environment variables inside of your code, use the `env` helper.

```jsx
// In a microfrontend
import React from 'react';
import { env } from 'react-microfe';

const apiUrl = env('API_URL');

function MyComponent() {
  return <div>My API Url is {apiUrl}</div>
}
```

To read environment variables inside of your code, use the `env` helper. This will first check the configuration specified by `importMicrofrontend`, followed by anything that was baked into `process.env` at build time. If no environment variable is found, this will fail loudly to help you catch configuration errors quickly in production. If you don't want it to fail loudly, or there is sensible default, you can pass a default value as a second parameter.

```jsx
// In a microfrontend
import React from 'react';
import { env } from 'react-microfe';

const isNewHomescreenEnabled = env('IS_NEW_HOMESCREEN_ENABLED', false);

function MyComponent() {
  return <div>Is new homescreen is enabled? {isNewHomescreenEnabled}</div>
}
```

## Advanced Topics

### CSS and Styling

Since you're injecting multiple apps into your main app shim, there is the possibility of having conflicting styles. Some suggestions:

- Use CSS modules. This is your best bet at making sure you'll never have a conflict.
- Alternatively, use something like BEM and give yourself a strong unique namespace
- Leverage CSS variables specified on the :root of your main app shim to set shared dependencies like colors and padding.
- NEVER include styles on generic elements from your microfrontend. Leave html, body and the rest alone. If you have to do any sort of normalization for development, make sure it's included from your index.js file that bootstraps your microfrontend, not in the microfrontend itself.

### Alternative Configuration Methods

You're not required to use the environment helpers or handling that come bundled with `react-microfe`. If your configuration variables are known ahead of time, one option is to make a separate build per environment (dev, stage, prod). Another option is to pass all configuration options directly to the component as a prop and avoid process.env entirely.

### Declaring additional shared external libraries

By default, React and ReactDOM are required in the `declareExternals` function, but you might have additional dependencies to be shared such as a UI library, or Redux. `patchWebpackConfig` takes an optional externals parameter that gets appended to the already included React and ReactDOM. The important piece here is to make sure you include `reactMicrofeExternals` prefix to your external definition followed by the object key that you plan on passing to `declareExternals`. See https://webpack.js.org/configuration/externals/#externalsj for more info.

```js
// microfe.config.js
const { patchWebpackConfig } = require('react-microfe');
const webpackConfig = require('./webpack.config');
const path = require('path');

module.exports = patchWebpackConfig({
  name: 'myfrontend',
  config: webpackConfig,
  entry: path.resolve(__dirname, './src/App.js'),
  externals: [
     jquery: 'reactMicrofeExternals.jQuery',
     lodash: 'reactMicrofeExternals._',
  ]
});
```

```jsx
// in your main app shim
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as jQuery from 'jquery';
import * as _ from 'lodash';

import { declareExternals } from 'react-microfe';

declareExternals({
  React,
  ReactDOM,
  jQuery,
  _
});

ReactDOM.render(<App />, document.getElementById('root'));
```

### Version management / deployment of microfrontends and cache busting

`react-microfe` purposely doesn't impose a specific structure on how you want to handle versions in your main app shim. One of the main goals of microfrontends is to be able to deploy independently, so ideally you allow your microfrontend urls to be specified through configuration. A simple example would involve specifying a version hash to break the cache.

```jsx
// in your main app shim
import React from 'react';
import { importMicrofrontend } from 'react-microfe';

// Notice we're not using the env helper here
// the env helper is only for accessing environment configuration in our microfrontend
// In your main app shim, this is up to however you handle configuration
const myFrontendVersion = process.env.MY_FRONTEND_VERSION;

const MyRemoteFrontend = React.lazy(() =>
  importMicrofrontend(`https://my.example.com/myfrontend.js?hash=${hash}`);
);
```

Another alternative is to host an import map somewhere that will be read by your main app at runtime. This is similar to the import map specified for the SystemJS spec. This setup is ideal if you're dealing with multiple microfrontends and want to control the source of truth for your app from a single location. A good way to handle this is to add a blocking script tag to the top of your html that pulls in your import map. That way it will be available when your code attempts to import your microfrontends. `react-microfe` doesn't handle this for you, but implementing it is trivial.

```js
// An example import map to be returned from your own backend.
// assuming you have microfrontends for a usersProfile and another for homepage.
window.myImportMap = {
  userProfile: 'https://my.example.com/userprofile.js?hash=v1',
  homepage: 'https://my.example.com/homepage.js?hash=v1'
}
```

```jsx
// in your main app shim
import React from 'react';
import { importMicrofrontend } from 'react-microfe';

const MyUserProfile = React.lazy(() =>
  importMicrofrontend(window.myImportMap.userProfile);
);

const MyHomePage = React.lazy(() =>
  importMicrofrontend(window.myImportMap.homepage);
);

function App() {
  return <div>
    <React.Suspense fallback="loading">
      <MyUserProfile />
    </React.Suspense>
    <React.Suspense fallback="loading">
      <MyHomePage />
    </React.Suspense>
  </div>
}
```




