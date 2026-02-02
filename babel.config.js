module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          'react-compiler': {
            logger: {
              logEvent(filename, event) {
                if (event.kind === 'CompileSuccess') {
                  console.log('✅ Compiled:', filename);
                }
                if (event.kind === 'CompileError') {
                  console.log('🛑 Compiled:', filename);
                }
              }
            }
          },
        },
      ],
    ],
  };
};
