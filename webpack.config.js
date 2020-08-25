const path = require('path');
//const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: './src/index.js',
        twopanels: './src/panels/twopanels.js',
        fourpanels: './src/panels/fourpanels.js',
        grid: './src/panels/grid.js'
    },
    watch: true,
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
    },
    output: {
        filename: 'js/[name].js',
        path: path.resolve(__dirname, 'dist'),
//        libraryTarget: 'var',
//        library: 'MoleculeViewer'
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|gif|glb|gltf|obj)$/,
                use: [
                  'file-loader',
              ],
          },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ]
            }
      ],
    },
//    plugins: [
//       new HtmlWebpackPlugin({
//        title: 'Development',
//      }), 
//    ],
};
