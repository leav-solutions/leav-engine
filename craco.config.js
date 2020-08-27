const CracoLessPlugin = require('craco-less');
const ThemingVar = require("./src/themingVar");

module.exports = {
    plugins: [{
        plugin: CracoLessPlugin,
        options: {
            lessLoaderOptions: {
                lessOptions: {
                    modifyVars: ThemingVar,
                    javascriptEnabled: true
                }
            }
        }
    }]
};