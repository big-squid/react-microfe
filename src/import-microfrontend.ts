const hash = (s: string) =>
  String(
    s.split('').reduce(function(a, b) {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0)
  );

const getDomId = (id: string) => `react-microfe-${id}`;
const getIdFromUrl = (url: string) => hash(url);

const loadScript = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const id = getIdFromUrl(url);
    const domId = getDomId(id);
    const existingScript = document.getElementById(domId);

    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = url;
      script.id = domId;
      document.body.appendChild(script);

      script.onload = () => {
        resolve(id);
      };
    }

    if (existingScript) resolve(id);
  });
};

const loadFrontendFactory = ({
  url,
  global
}: {
  url: string;
  global: string;
}): Promise<any> => {
  const win = window as any;
  const id = getIdFromUrl(url);

  const promise =
    win.reactMicrofeModules && win.reactMicrofeModules[id]
      ? Promise.resolve(win.reactMicrofeModules[id])
      : loadScript(url).then(id => {
          win.reactMicrofeModules = win.reactMicrofeModules || {};
          win.reactMicrofeModules[id] = win[global];
          return win.reactMicrofeModules[id];
        });

  return promise;
};

const loadRemoteEnv = (url: string) => fetch(url).then(res => res.json());

const loadEnvironments = ({
  remoteEnv,
  env = {}
}: {
  remoteEnv?: string;
  env?: { [key: string]: any };
}) => {
  const promise = remoteEnv ? loadRemoteEnv(remoteEnv) : Promise.resolve({});
  return promise.then(loadedEnv => ({
    ...env,
    ...loadedEnv
  }));
};

export const importMicrofrontend = (
  args:
    | string
    | {
        url: string;
        global?: string;
        remoteEnv?: string;
        env?: { [key: string]: any };
      }
) => {
  const {
    url,
    remoteEnv = undefined,
    env = undefined,
    global = 'reactMicrofeLoadedModule'
  } = typeof args === 'string' ? { url: args } : args;

  const promises = [
    loadFrontendFactory({
      url,
      global
    }),
    loadEnvironments({ remoteEnv, env })
  ];

  return Promise.all(promises).then(([factory, env]) => factory(env));
};

export default importMicrofrontend;
