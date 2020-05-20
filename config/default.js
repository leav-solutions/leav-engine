module.exports = {
    inputRootPath: process.env.INPUT_ROOT_PATH,
    outputRootPath: process.env.OUTPUT_ROOT_PATH,
    ICCPath: process.env.ICC_PATH,
    amqp: {
        protocol: 'amqp',
        hostname: process.env.AMQP_HOST,
        port: process.env.AMQP_PORT || 15672,
        username: process.env.AMQP_USERNAME,
        password: process.env.AMQP_PWD,
        type: process.env.AMQP_TYPE || 'direct',
        consume: {
            queue: process.env.AMQP_QUEUE_IN,
            exchange: process.env.AMQP_EXCHANGE_IN,
            routingKey: process.env.AMQP_ROUTING_KEY_IN,
        },
        publish: {
            queue: process.env.AMQP_QUEUE_OUT,
            exchange: process.env.AMQP_EXCHANGE_OUT,
            routingKey: process.env.AMQP_ROUTING_KEY_OUT,
        },
    },
    verbose: process.env.VERBOSE || false,
};
