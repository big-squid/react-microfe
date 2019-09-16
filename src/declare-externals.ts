export const declareExternals = (externalDeclarations: {
  React: any;
  ReactDOM: any;
  [key: string]: any;
}) => {
  const win = window as any;
  win.reactMicrofeExternals = win.reactMicrofeExternals || {};

  const ext = win.reactMicrofeExternals;

  Object.keys(externalDeclarations).forEach(key => {
    ext[key] = externalDeclarations[key];
  });
};

export default declareExternals;
