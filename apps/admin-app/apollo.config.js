const token = require('./apollo.token');

const apiUrl = 'http://core.leav.localhost';
module.exports = {
    client: {
        service: {
            name: 'default',
            url: `${apiUrl}/graphql`,
            headers: {
                authorization: token
            }
        }
    }
};
