module.exports = {
    inputRootPath: process.env.INPUT_ROOT_PATH,
    outputRootPath: process.env.OUTPUT_ROOT_PATH,
    ICCPath: process.env.ICC_PATH,
    amqp: {
        protocol: 'amqp',
        hostname: process.env.AMQP_HOST,
        port: process.env.AMQP_PORT || 5672,
        username: process.env.AMQP_USERNAME,
        password: process.env.AMQP_PWD,
        type: process.env.AMQP_TYPE || 'direct',
        consume: {
            queue: process.env.AMQP_QUEUE_IN || 'files_preview_request',
            exchange: process.env.AMQP_EXCHANGE_IN || 'leav_core',
            routingKey: process.env.AMQP_ROUTING_KEY_IN || 'files.previewRequest'
        },
        publish: {
            queue: process.env.AMQP_QUEUE_OUT || 'files_preview_response',
            exchange: process.env.AMQP_EXCHANGE_OUT || 'leav_core',
            routingKey: process.env.AMQP_ROUTING_KEY_OUT || 'files.previewResponse'
        }
    },
    verbose: process.env.VERBOSE || false
};
