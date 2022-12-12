const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = {
  entry: './bootstrap.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bootstrap.js'
  },
  experiments: {
    asyncWebAssembly: true
  },
  mode: 'development',
  plugins: [
    new CopyPlugin({
      patterns: [
        'index.html',
        'cookiePolicy.html',
        { from: 'static', to: 'static' }
      ]
    })
  ]
}
