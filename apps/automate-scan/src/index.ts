// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {startWatch} from './setupWatcher/setupWatcher';

process.on('exit', code => {
    console.info('Process exit event with code:', code);
});

process.on('uncaughtException', err => {
    console.error('1 - There was an uncaught error', err);
    process.exit(1); // mandatory (as per the Node.js docs)
});

// handle CTRL + C
process.on('SIGINT', () => {
    console.info();
    console.info('0 - User stop the app');
    process.exit(0);
});

startWatch();
