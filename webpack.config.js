const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const WatchExternalFilesPlugin = require('webpack-watch-files-plugin').default;

const twigExtention = 'html.twig';

const dir = (pth) => path.join(__dirname, pth);

const pages = [];

fs.readdirSync(dir('/src/views/pages')).forEach(file => {
  try {
    const page = {};

    fs.readdirSync(dir(`/src/views/pages/${file}`)).forEach(fl => {
      if (fl === `page.${twigExtention}`) page.name = file
    });

    pages.push(page);
  } catch (error) {
    console.log(error)
  }
});

module.exports = {
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 200,
    poll: 1000,
  },
  entry: './src/app.js',
  output: {
    filename: 'app.[contenthash].js',
    path: dir('dist'),
  },
  module: {
    rules: [
      {
        test: /\.html.twig$/,
        use: [
          'raw-loader',
          {
            loader: 'twig-html-loader',
            options: {
              data(sm) {
                return {
                  json(url) {
                    const dt = require(path.resolve(sm.resourcePath.replace(`page.${twigExtention}`, ''), url))
                    return dt;
                  },
                };
              },
              namespaces: {
                components: path.resolve(__dirname, 'src/views/components'),
                pages: path.resolve(__dirname, 'src/views/pages'),
                layouts: path.resolve(__dirname, 'src/views/layouts'),
              },
            },
          }
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new WatchExternalFilesPlugin({
      files: [
        './src/**',
      ]
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "app.[contenthash].css",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/assets', to: './assets' }
      ]
    }),
    ...pages.map(page => new HTMLWebpackPlugin({
      template: `src/views/pages/${page.name}/page.${twigExtention}`,
      filename: `${page.name}.html`,
    }))
  ],
}