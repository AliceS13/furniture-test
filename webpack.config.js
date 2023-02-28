const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const RELEASE_FOLDER = './dist';

const preprocessor = (content, loaderContext) => content.replace(
    /<include src="(.+)"\s*\/?>(?:<\/include>)?/gi,
    (_m, src) => {
        const filePath = path.resolve(loaderContext.context, src);
        const fileRaw = fs.readFileSync(filePath, 'utf8');

        loaderContext.dependency(filePath);

        return preprocessor(fileRaw, loaderContext);
    },
);

if (fs.existsSync(RELEASE_FOLDER)) {
    fs.rmdirSync(RELEASE_FOLDER, { recursive: true });
}

module.exports = (_env, options) => {
    // ENV 'production' means build into dist folder
    const PRODUCTION_ENV = process.env.NODE_ENV === 'production';
    // MODE 'production' means build minification
    const PRODUCTION_MODE = options.mode === 'production';
    // eslint-disable-next-line no-console
    console.info(`RUNNING BUILD WITH MODE=${options.mode} AND ENV = ${process.env.NODE_ENV}`);

    const htmlFiles = fs.readdirSync('./src').filter((file) => file.includes('html'));
    const pages = htmlFiles.map((filename) => new HtmlWebpackPlugin({
        inject: 'body',
        filename: filename,
        template: `./src/${filename}`,
        minify: {
            collapseWhitespace: PRODUCTION_MODE,
        },
    }));

    return {
        entry: { index: './src/js/index.js', style: './src/scss/style.scss' },
        devtool: PRODUCTION_MODE ? undefined : 'source-map',
        devServer: { contentBase: RELEASE_FOLDER, hot: false },
        module: {
            rules: [
                {
                    test: /\.(png|jpg|svg)$/i,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: 'img/[name].[ext]',
                        },
                    },
                },
                {
                    loader: 'image-webpack-loader',
                    options: {
                      mozjpeg: {
                        progressive: true,
                        quality: 65
                      },
                      optipng: {
                        enabled: false,
                      },
                      pngquant: {
                        quality: [0.3, 0.7],
                        speed: 4
                      },
                      gifsicle: {
                        interlaced: false,
                      },
                      webp: {
                        quality: 75
                      }
                    }
                },
                {
                    test: /\.(html)$/,
                    use: {
                        loader: 'html-loader',
                        options: {
                            preprocessor
                        },
                    },
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        PRODUCTION_ENV ? { loader: MiniCssExtractPlugin.loader, options: { publicPath: '' } } : 'style-loader',
                        'css-loader',
                        'sass-loader',
                    ],
                },
                {
                    test: /\.(ttf|woff|woff2|eot)$/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'fonts/',
                        },
                    },
                },
            ],
        },
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: '',
        },
        plugins: [
            new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery' }),

            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[id].css',
            }),
            ...pages
        ],
        stats: {
            children: true
        },
        optimization: {
            minimize: PRODUCTION_MODE,
            minimizer: PRODUCTION_MODE ? [new TerserPlugin(), new CssMinimizerPlugin()] : [],
        },
    };
};
