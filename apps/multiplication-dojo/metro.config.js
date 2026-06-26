const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [path.resolve(monorepoRoot, 'packages')]
config.resolver.blockList = [
  ...(config.resolver.blockList ?? []),
  new RegExp(`${path.resolve(monorepoRoot, '.agents').replace(/\\/g, '\\\\')}[\\\\/].*`),
]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

module.exports = withNativeWind(config, { input: './global.css' })
