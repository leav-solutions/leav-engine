// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    allowFilesList: '',
    ignoreFilesList: '',
    rootPath: '/files',
    rootKey: 'files1',
    amqp: {
        protocol: 'amqp',
        queue: 'test_files_events',
        exchange: 'test_leav_core',
        routingKey: 'files.event',
        type: 'direct'
    },
    watcher: {
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 100
        },
        delay: 150
    },
    verbose: true
};
