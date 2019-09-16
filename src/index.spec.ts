// @ts-ignore
global.fetch = require('jest-fetch-mock');
// @ts-ignore
import mockScriptTag from '../__mocks__/mock-script-tag';
import { FetchMock } from 'jest-fetch-mock';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  declareExternals,
  env,
  importMicrofrontend,
  patchWebpackConfig
} from './';

const fetchMock = fetch as FetchMock;

describe('declareExternals', () => {
  it('declareExternals', () => {
    const fakeModule = {
      default: () => {}
    };

    declareExternals({
      React,
      ReactDOM,
      fakeModule
    });

    const win = window as any;

    expect(win.reactMicrofeExternals.React).toBe(React);
    expect(win.reactMicrofeExternals.ReactDOM).toBe(ReactDOM);
    expect(win.reactMicrofeExternals.fakeModule).toBe(fakeModule);
  });
});

describe('env', () => {
  afterEach(() => {
    (window as any).reactMicrofeEnv = undefined;
    (window as any).process = undefined;
  });

  it('works without global reactMicrofeEnv', () => {
    // usually the reactMicrofeEnv variable would be in scope of the build
    // but fake it here to be on the window
    expect(() => env('MY_VAR')).toThrowError();
  });

  it('works with global reactMicrofeEnv', () => {
    // usually the reactMicrofeEnv variable would be in scope of the build
    // but fake it here to be on the window
    (window as any).reactMicrofeEnv = { MY_VAR: 'Foo' };
    const myVar = env('MY_VAR');
    expect(myVar).toBe('Foo');
  });

  it('works without process.env', () => {
    // This gets built into webpack builds usually
    // but fake it here to be on the window
    expect(() => env('MY_VAR')).toThrowError();
  });

  it('works with process.env', () => {
    // This gets built into webpack builds usually
    // but fake it here to be on the window
    (window as any).process = { env: { MY_VAR: 'Foo' } };
    const myVar = env('MY_VAR');
    expect(myVar).toBe('Foo');
  });

  it('works with defaults', () => {
    const myVar = env('MY_VAR', 'defaultVal');
    expect(myVar).toBe('defaultVal');
  });

  it('throws without default', () => {
    expect(() => env('MY_VAR')).toThrowError();
  });
});

describe('importMicrofrontend', () => {
  const existingCreateElement = document.createElement;
  const url = '/myfe.js';
  const id = '1822743453';
  const domId = 'react-microfe-1822743453';
  const win = window as any;
  const fakeFrontend = function(reactMicrofeEnv: any) {
    reactMicrofeEnv = reactMicrofeEnv || {};
    return {
      default: () => {}
    };
  };
  beforeEach(() => {
    win.reactMicrofeModules = undefined;
  });

  beforeAll(() => {
    mockScriptTag(document, (src: string) => {
      (window as any).reactMicrofeLoadedModule = fakeFrontend;
    });
  });

  afterAll(() => {
    document.createElement = existingCreateElement;
  });

  it('imports as string', async done => {
    await importMicrofrontend(url);
    expect(document.getElementById(domId)).toBeTruthy();
    expect((window as any).reactMicrofeModules[id]).toBe(fakeFrontend);
    done();
  });

  it('imports as object', async done => {
    await importMicrofrontend({ url });
    expect(document.getElementById(domId)).toBeTruthy();
    expect(win.reactMicrofeModules[id]).toBe(fakeFrontend);
    done();
  });

  it('works with local env', async done => {
    const myEnv = { MY_VAR: 'foo' };
    win.reactMicrofeModules = win.reactMicrofeModules || {};
    win.reactMicrofeModules[id] = jest.fn();
    await importMicrofrontend({ url, env: myEnv });
    expect(win.reactMicrofeModules[id]).toHaveBeenCalledWith(myEnv);
    done();
  });

  it('works with remote env', async done => {
    const myEnv = { MY_VAR: 'foo' };
    win.reactMicrofeModules = win.reactMicrofeModules || {};
    win.reactMicrofeModules[id] = jest.fn();
    fetchMock.mockResponseOnce(JSON.stringify(myEnv));
    await importMicrofrontend({ url, remoteEnv: '/remoteconfig.js' });
    expect(win.reactMicrofeModules[id]).toHaveBeenCalledWith(myEnv);
    done();
  });

  it('works with local and remote env', async done => {
    const myRemoteEnv = { MY_REMOTE: 'foo' };
    const myLocalEnv = { MY_LOCAL: 'foo' };
    win.reactMicrofeModules = win.reactMicrofeModules || {};
    win.reactMicrofeModules[id] = jest.fn();
    fetchMock.mockResponseOnce(JSON.stringify(myRemoteEnv));
    await importMicrofrontend({
      url,
      remoteEnv: '/remoteconfig.js',
      env: myLocalEnv
    });
    expect(win.reactMicrofeModules[id]).toHaveBeenCalledWith({
      ...myRemoteEnv,
      ...myLocalEnv
    });
    done();
  });

  it('allows specifying a different global', async done => {
    win.myGlobalName = win.reactMicrofeLoadedModule;
    await importMicrofrontend({ url, global: 'myGlobalName' });
    expect(document.getElementById(domId)).toBeTruthy();
    expect((window as any).reactMicrofeModules[id]).toBe(fakeFrontend);
    done();
  });
});

describe('patchWebpackConfig', () => {
  it('throws without config', () => {
    expect(() =>
      patchWebpackConfig({ name: '', config: undefined })
    ).toThrowError();
  });

  it('throws without name', () => {
    expect(() => patchWebpackConfig({ name: '', config: {} })).toThrowError();
  });

  it('works with empty config', () => {
    patchWebpackConfig({ name: 'myModule', config: {} });
  });

  it('works with entry', () => {
    patchWebpackConfig({
      name: 'myModule',
      entry: '/foo.js',
      config: {}
    });

    patchWebpackConfig({
      name: 'myModule',
      entry: ['/foo.js'],
      config: {}
    });
  });

  it('works with externals', () => {
    patchWebpackConfig({
      name: 'myModule',
      externals: {},
      config: { externals: {} }
    });
    patchWebpackConfig({
      name: 'myModule',
      externals: [],
      config: {
        externals: []
      }
    });
  });
});
