const craConfig = require('react-scripts/config/webpack.config');
const { patchWebpackConfig } = require('react-microfe');
const path = require('path');

module.exports = patchWebpackConfig({name: 'myfrontend',  config: craConfig(process.env.NODE_ENV), entry: path.resolve(__dirname, './src/App.js')});
