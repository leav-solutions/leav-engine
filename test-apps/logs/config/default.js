// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    coreUrl: process.env.CORE_URL || 'http://core.leav.localhost',
    auth: {
        login: process.env.AUTH_login || 'admin',
        password: process.env.AUTH_PASSWORD || 'admin'
    }
};
