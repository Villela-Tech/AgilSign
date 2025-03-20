const webpack = require('webpack');

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "process": false,
          "https": require.resolve("https-browserify"),
          "http": require.resolve("stream-http"),
          "stream": require.resolve("stream-browserify"),
          "buffer": require.resolve("buffer")
        }
      },
      plugins: [
        new webpack.ProvidePlugin({
          process: require.resolve('process/browser'),
          Buffer: ['buffer', 'Buffer']
        })
      ]
    }
  }
} 