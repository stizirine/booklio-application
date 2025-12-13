const CracoAlias = require('craco-alias');

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: '.',
        tsConfigPath: './tsconfig.json',
      },
    },
  ],
  webpack: {
    configure: (webpackConfig) => {
      // Désactiver React Refresh en production
      if (process.env.NODE_ENV === 'production') {
        // Trouver et modifier la règle Babel
        const babelRule = webpackConfig.module.rules.find(
          (rule) => rule.oneOf && rule.oneOf.some((oneOf) => oneOf.loader && oneOf.loader.includes('babel-loader'))
        );
        
        if (babelRule && babelRule.oneOf) {
          babelRule.oneOf.forEach((oneOf) => {
            if (oneOf.options && oneOf.options.plugins) {
              oneOf.options.plugins = oneOf.options.plugins.filter(
                (plugin) => {
                  if (Array.isArray(plugin)) {
                    return !plugin[0] || !plugin[0].includes('react-refresh');
                  }
                  return !plugin || !plugin.includes('react-refresh');
                }
              );
            }
          });
        }
      }
      return webpackConfig;
    },
  },
  // plus de custom webpack: on reste en CSS pur, config CRA par défaut
};


