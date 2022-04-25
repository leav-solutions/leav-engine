// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
