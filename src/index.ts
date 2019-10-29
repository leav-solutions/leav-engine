import {startWatch} from './setupWatcher/setupWatcher';

process.on('exit', code => {
    console.info('Process exit event with code:', code);
});

process.on('uncaughtException', err => {
    console.error('There was an uncaught error', err);
    process.exit(1); // mandatory (as per the Node.js docs)
});

// handle CTRL + C
process.on('SIGINT', () => {
    console.info();
    console.info('User stop the app');
    process.exit(0);
});

// Get first arg
const configPathArg = process.argv[2];

startWatch(configPathArg);
