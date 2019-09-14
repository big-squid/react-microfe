import React from 'react';
import logo from './logo.svg';
import styles from './App.module.css';

import { env } from 'react-microfe';

function App() {
  console.log(env('LOCAL_VAR', null));
  console.log(env('REMOTE_VAR', null));
  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <img src={logo} className={styles.appLogo} alt="logo" />
        <p>
          Remote App
        </p>
        <a
          className={styles.appLink}
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
