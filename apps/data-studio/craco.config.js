// craco.config.js
module.exports = {
    webpack: {
        configure: {
            resolve: {
                fallback: {
                    path: false
                }
            }
        }
    }
};
