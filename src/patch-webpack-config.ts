import { Configuration } from 'webpack';
// @ts-ignore
import WrapperPlugin from 'wrapper-webpack-plugin';

export const patchWebpackConfig = ({
  name,
  config,
  entry,
  externals
}: {
  name: string;
  config: any;
  entry?: Configuration['entry'];
  externals?: Configuration['externals'];
}) => {
  if (!config) {
    throw Error('Config missing. Please pass an existing webpack config.');
  }

  if (!name) {
    throw Error(
      'The name parameter is required. Please specify a name for your Micro Frontend. Names should be javascript variable safe.'
    );
  }

  config.entry = entry ? entry : config.entry;
  config.entry = Array.isArray(config.entry) ? config.entry : [config.entry];

  config.optimization = config.optimization || {};
  config.optimization.splitChunks = config.optimization.splitChunks || {};

  // This tricks Webpack into making a single file
  // basically telling it unless the file is over 1 GB, don't make a chunk for it.
  config.optimization.splitChunks.minSize = 1000000000;

  // kil the runtime chunk
  config.optimization.runtimeChunk = false;
  config.output = config.output || {};

  config.output.library = `reactMicrofeInternalModule`;
  config.output.libraryTarget = 'var';
  config.output.auxiliaryComment = 'Hello';
  config.output.filename = `${name}.js`;

  // make externals if they don't exist
  if (!config.externals) {
    config.externals = [];
  }

  // They do exist and not an array, make sure they're an array
  if (!Array.isArray(config.externals)) {
    config.externals = [config.externals];
  }

  // add a users custom externals if they have any
  if (externals) {
    externals = Array.isArray(externals) ? externals : [externals];
    config.externals.push(...externals);
  }

  // Add React and ReactDOM
  config.externals.push({
    react: 'reactMicrofeExternals.React',
    'react-dom': 'reactMicrofeExternals.ReactDOM'
  });

  config.plugins = config.plugins || [];
  config.plugins.push(
    new WrapperPlugin({
      test: /\.js$/, // only wrap output of bundle files with '.js' extension
      header:
        'window.reactMicrofeLoadedModule = (function (reactMicrofeEnv) {\nreactMicrofeEnv = reactMicrofeEnv || {};\n',
      footer: '\nreturn reactMicrofeInternalModule;\n});'
    })
  );

  return config;
};

export default patchWebpackConfig;
