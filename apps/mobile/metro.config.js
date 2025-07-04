// Learn more https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
// eslint-disable-next-line no-undef
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Force Metro to resolve dependencies from the root
config.resolver.disableHierarchicalLookup = true;

// 4. Add platforms for better resolution
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

// 5. Configure transformer to handle source maps properly
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});

// 6. Configure symbolication to avoid accessing missing source files
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    return (req, res, next) => {
      // Skip symbolication for missing source files
      if (req.url && req.url.includes('symbolicate')) {
        try {
          return middleware(req, res, next);
        } catch (error) {
          if (error.code === 'ENOENT') {
            // Return empty response for missing source files
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('{}');
            return;
          }
          throw error;
        }
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
