////// a simple test to display the token of the session.
////// to run call: AUTH_KEY=1 node src/__tests__/e2e/test.js (windows)

const jwt = require('jsonwebtoken');

async function _getAuthToken() {

    const conf = {
        db: {
            url: process.env.ARANGO_URL,
            name: process.env.DB_NAME
        },
        auth: {
            scheme: 'jwt',
            key: process.env.AUTH_KEY,
            algorithm: 'HS256',
            tokenExpiration: '7d'
        }
    };

    const token = jwt.sign(
        {
            userId: 1,
            login: 'admin',
            role: 'admin'
        },
        conf.auth.key,
        {
            algorithm: conf.auth.algorithm,
            expiresIn: conf.auth.tokenExpiration
        }
    );
    
    console.log(token);
    return token;
};

_getAuthToken();