import React from 'react';
import logo from './logo.svg';
import './App.css';

import { importMicrofrontend } from 'react-microfe';

const MyRemoteFrontend = React.lazy(() =>
  importMicrofrontend({url: 'http://localhost:3001/myfrontend.js', remoteEnv: '/config.json', env: {LOCAL_VAR:'Hello World Local'}})
);

function App() {
  return (
    <div style={{display: 'flex'}}>
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Main App
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
    <React.Suspense fallback={<div>Loading</div>}>
      <MyRemoteFrontend/>
    </React.Suspense>
    </div>
  );
}

export default App;
