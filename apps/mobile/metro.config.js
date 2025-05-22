const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Get the default config
const config = getDefaultConfig(__dirname);

// Apply the NativeWind transformer with the path to your global.css file
const nativeWindConfig = withNativeWind(config, { 
  input: './global.css',
  configPath: './tailwind.config.js'
});

module.exports = nativeWindConfig; 