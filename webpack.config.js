const htmlPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = (env)=>{
    return {
        mode: env,
        output: {
            filename: 'bundle.js'
        },
        plugins:[new htmlPlugin(), new webpack.ProgressPlugin()]
    }
}