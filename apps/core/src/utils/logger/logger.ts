// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as logger from 'winston';

interface IDeps {
    config?: any;
}
export default function ({config = null}: IDeps = {}) {
    if (typeof config.logs !== 'undefined') {
        const transports = (config.logs.transport ?? '').split(',').map(transport => {
            if (transport === 'console') {
                return new logger.transports.Console({
                    colorize: true
                });
            } else if (transport === 'file') {
                return new logger.transports.File({
                    filename: config.logs.destinationFile,
                    json: config.logs.useJsonFormat
                });
            }
        });

        logger.configure({
            level: config.logs.level,
            handleExceptions: true,
            transports
        });
    }

    return logger;
}
