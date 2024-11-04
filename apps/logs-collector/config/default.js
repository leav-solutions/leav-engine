// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    amqp: {
        protocol: 'amqp',
        exchange: process.env.AMQP_EXCHANGE || 'leav_core',
        hostname: process.env.AMQP_HOST,
        port: process.env.AMQP_PORT || 5672,
        username: process.env.AMQP_USERNAME,
        password: process.env.AMQP_PWD,
        type: process.env.AMQP_TYPE || 'direct',
        queue: process.env.AMQP_QUEUE || 'logs_events',
        routingKey: process.env.AMQP_ROUTING_KEY || 'data.events'
    },
    elasticsearch: {
        url: process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200'
    },
    debug: process.env.DEBUG || false
};
