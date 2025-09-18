// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import winston from 'winston';
import Bugsnag from '@bugsnag/js';

interface IDeps {
    config?: any;
}
export default function ({config = null}: IDeps = {}) {
    if (typeof config.logs !== 'undefined') {
        const transports = (config.logs.transport ?? '').split(',').map((transport: string) => {
            if (transport === 'console') {
                return new winston.transports.Console({
                    colorize: true
                });
            } else if (transport === 'file') {
                return new winston.transports.File({
                    filename: config.logs.destinationFile,
                    json: config.logs.useJsonFormat
                });
            }

            throw new Error(`Unknown transport type: ${transport}`);
        });

        winston.configure({
            level: config.logs.level,
            handleExceptions: true,
            transports
        });
    }

    if (config.bugsnag.enable) {
        const originalErrorFunc = winston.error.bind(winston);

        winston.error = (message: string, ...meta: any[]) => {
            Bugsnag.notify(new Error(JSON.stringify({message, meta})));
            return originalErrorFunc(message, ...meta);
        };
    }

    return winston;
}
