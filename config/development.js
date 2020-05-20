module.exports = {
    inputRootPath: '/files',
    outputRootPath: '/results',
    ICCPath: '/app/profile/',
    amqp: {
        hostname: 'message_broker',
        username: 'guest',
        password: 'guest',
        consume: {
            queue: 'files_preview_request',
            exchange: 'leav_core',
            routingKey: 'files.previewRequest',
        },
        publish: {
            queue: 'files_preview_response',
            exchange: 'leav_core',
            routingKey: 'files.previewResponse',
        },
    },
    verbose: true,
};
