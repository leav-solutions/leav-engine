const token = require('./apollo.token');

const apiUrl = 'http://localhost:4001';
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
