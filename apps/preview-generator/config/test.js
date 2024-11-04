// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
