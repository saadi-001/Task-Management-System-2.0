const { getDefaultConfig } = require('expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);
// Add alias for missing asset-registry module
defaultConfig.resolver.extraNodeModules = {
  ...(defaultConfig.resolver.extraNodeModules || {}),
  'react-native/asset-registry': require.resolve('./src/asset-registry-stub.js'),
};
module.exports = defaultConfig;
