const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Resolver problemas com módulos Node.js no React Native
const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Ignorar módulos Node.js que não são compatíveis com React Native
  const problematicModules = [
    'call-bind/callBound',
    'call-bind',
    'assert',
    'util',
    'stream',
  ];
  
  if (problematicModules.some(mod => moduleName === mod || moduleName.startsWith(`${mod}/`))) {
    // Retornar um módulo vazio
    return {
      type: 'empty',
    };
  }
  
  // Usar resolução padrão para outros módulos
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Adicionar configuração para bloquear módulos problemáticos
if (!config.resolver.blockList) {
  config.resolver.blockList = [];
}
config.resolver.blockList.push(
  /node_modules[\/\\]assert[\/\\].*/,
  /node_modules[\/\\]call-bind[\/\\].*/,
);

module.exports = withNativeWind(config, { input: './global.css' });

