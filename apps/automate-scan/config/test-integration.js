// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const rootPath = require('app-root-path');

module.exports = {
    rootPath: rootPath.path + '/src/__tests__/_fixtures',
    amqp: {
        protocol: 'amqp',
        hostname: process.env.AMQP_HOST,
        port: process.env.AMQP_PORT || '5672',
        username: process.env.AMQP_USERNAME,
        password: process.env.AMQP_PWD,
        queue: 'test_files_events',
        exchange: 'test_leav_core',
        routingKey: 'files.event',
        type: process.env.AMQP_TYPE || 'direct'
    },
    verbose: true
};
