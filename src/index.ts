import {getConfig} from './getConfig/getConfig';
import {startConsume} from './amqp/startConsume';

// show code when use process exit without error message
process.on('exit', code => {
    console.info('Process exit event with code:', code);
});

// handle CTRL + C
process.on('SIGINT', () => {
    console.info();
    console.info('0 - User stop the app');
    process.exit(0);
});

const configPath = process.argv[2] || './config/config.json';

const config = getConfig(configPath);

startConsume(config);
