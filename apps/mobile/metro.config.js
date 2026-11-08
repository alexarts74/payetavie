const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Watch workspace packages so Metro picks up changes
config.watchFolders = [workspaceRoot]

// Resolve modules from both project and workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// Apply NativeWind first, then patch the resolver so our React pinning
// runs AFTER NativeWind's own resolver (which withNativeWind may set).
const nativeWindConfig = withNativeWind(config, { input: './global.css' })

// Force a single React instance across the entire mobile bundle.
// In this monorepo, apps/web uses React 19 and apps/mobile uses React 18.
// npm workspace hoisting can place different React versions at different paths,
// causing nativewind (hoisted to root node_modules) to import a different React
// than the mobile app. Two React instances break React fiber internals (ReactCurrentOwner).
//
// resolveRequest intercepts ALL module resolutions (including from inside node_modules),
// unlike extraNodeModules which only applies to the project's own files.
const REACT_MODULES = new Set([
  'react',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-dom',
  'react-dom/client',
])
const nativeWindResolve = nativeWindConfig.resolver.resolveRequest
nativeWindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (REACT_MODULES.has(moduleName)) {
    // Re-resolve from metro.config.js location so we always get the mobile app's React
    const delegate = nativeWindResolve ?? context.resolveRequest
    return delegate({ ...context, originModulePath: __filename }, moduleName, platform)
  }
  return (nativeWindResolve ?? context.resolveRequest)(context, moduleName, platform)
}

module.exports = nativeWindConfig
