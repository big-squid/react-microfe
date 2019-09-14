export const declareExternals = (externalDeclarations: {
  React: any;
  ReactDOM: any;
  [key: string]: any;
}) => {
  (window as any).reactMicrofe = (window as any).reactMicrofe || {};

  const ext = (window as any).reactMicrofe;

  Object.keys(externalDeclarations).forEach(key => {
    ext[key] = externalDeclarations[key];
  });
};

export default declareExternals;
