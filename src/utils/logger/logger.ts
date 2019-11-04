import * as logger from 'winston';

interface IDeps {
    config?: any;
}
export default function({config = null}: IDeps = {}): logger.Winston {
    if (typeof config.logs !== 'undefined') {
        const transports = config.logs.transport.map(transport => {
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
