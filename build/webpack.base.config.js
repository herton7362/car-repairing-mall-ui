const path = require('path');
const os = require('os');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const autoprefixer = require('autoprefixer');
const theme = require('../package.json').theme;

function resolve (dir) {
    return path.join(__dirname, dir);
}

const postcssOpts = {
    ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
    plugins: () => [
        autoprefixer({
            browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
        }),
        // pxtorem({ rootValue: 100, propWhiteList: [] })
    ]
};

module.exports = {
    entry: {
        main: '@/index.jsx',
        'vender-base': '@/vendors/vendors.base.js',
        'vender-exten': '@/vendors/vendors.exten.js'
    },
    output: {
        path: path.resolve(__dirname, '../dist/dist')
    },
    module: {
        rules: [
            {
                test: /\.jsx$/, exclude: /node_modules/, loader: 'babel-loader',
                options: {
                    plugins: [
                        'external-helpers', // why not work?
                        ["transform-runtime", { polyfill: false }],
                        ["import", [{ "style": true, "libraryName": "antd-mobile" }]]
                    ],
                    presets: ['es2015', 'stage-0', 'react']
                    // presets: [['es2015', { modules: false }], 'stage-0', 'react'] // tree-shaking
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js[x]?$/,
                include: [resolve('src')],
                exclude: /node_modules/,
                loader: 'happypack/loader?id=happybabel'
            },
            {
                test: /\.less$/i, use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        { loader: 'postcss-loader', options: postcssOpts },
                        {loader: 'less-loader', options: {modifyVars: theme}}
                    ]
                })
            },
            {
                test: /\.css$/i, use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader?minimize', { loader: 'postcss-loader', options: postcssOpts }
                    ]
                })
            },

            {
                test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
                loader: 'url-loader?limit=1024'
            },
            {
                test: /\.(html|tpl)$/,
                loader: 'html-loader'
            }
        ]
    },
    plugins: [
        new HappyPack({
            id: 'happybabel',
            loaders: ['babel-loader'],
            threadPool: happyThreadPool,
            verbose: true
        })
    ],
    resolve: {
        extensions: ['.web.js', '.jsx', '.js', '.json'],
        alias: {
            '@': resolve('../src')
        }
    }
};
