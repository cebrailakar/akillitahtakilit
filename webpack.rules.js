const path = require("path");

module.exports = [
    // Add support for native node modules
    {
        test: /native_modules[/\\].+\.node$/,
        use: 'node-loader',
    },
    {
        test: /\.ts?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
            loader: 'ts-loader',
            options: {
                transpileOnly: true
            }
        },
        resolve: {
            extensions: ['.ts', '.js', '.json'],
            alias: {
                '@': path.resolve(__dirname, 'src')
            }
        }
    }
];