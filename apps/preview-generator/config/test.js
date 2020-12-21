module.exports = {
    amqp: {
        consume: {
            queue: 'test_files_preview_request',
            exchange: 'test_leav_core',
            routingKey: 'files.previewRequest'
        },
        publish: {
            queue: 'test_files_preview_response',
            exchange: 'test_leav_core',
            routingKey: 'files.previewResponse'
        }
    },
    verbose: true
};
