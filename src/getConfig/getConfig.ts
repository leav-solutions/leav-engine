import * as fs from 'fs';
import {IConfig} from '../types/types';

let initialized = false;
let config: IConfig = {
    inputRootPath: '',
    outputRootPath: '',
    ICCPath: '',
    amqp: {
        protocol: '',
        hostname: '',
        port: 0,
        username: '',
        password: '',
        consume: {
            queue: '',
            exchange: '',
            routingKey: '',
        },
        publish: {
            queue: '',
            exchange: '',
            routingKey: '',
        },
    },
};

export const getConfig = (configPath?: string) => {
    if (!initialized) {
        if (!fs.existsSync(configPath)) {
            console.error('Config file not found');
            process.exit(1);
        }

        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        initialized = true;
        return config;
    } else {
        return config;
    }
};
