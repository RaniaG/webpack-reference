const htmlPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = (env)=>{
    return {
        mode: env,
        output: {
            filename: '[chunkhash].[name].bundle.js'
        },
        plugins:[new htmlPlugin(), new webpack.ProgressPlugin()],
        entry:
        {
            shared: ['./src/index.js', './src/index2.js']
        }
    }
}