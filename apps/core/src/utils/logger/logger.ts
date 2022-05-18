// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as logger from 'winston';

interface IDeps {
    config?: any;
}
export default function ({config = null}: IDeps = {}): logger.Winston {
    if (typeof config.logs !== 'undefined') {
        const transports = (config.logs.transport ?? '').split(',').map(transport => {
            if (transport === 'console') {
                return new logger.transports.Console({
                    colorize: true
                });
            } else if (transport === 'file') {
                return new logger.transports.File({
                    filename: config.logs.destinationFile,
                    json: false
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
