// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as winston from 'winston';
import {type ILoggerConfig, loggerConfig} from './config';

export type ILogger = Pick<typeof winston, 'error' | 'warn' | 'info' | 'log' | 'verbose' | 'debug' | 'silly'>;

export function configureLogger(config: ILoggerConfig): void {
    const transports: winston.transport[] = [
        new winston.transports.Console({
            format: config.useJsonFormat
                ? winston.format.json()
                : winston.format.combine(winston.format.colorize(), winston.format.simple())
        })
    ];
    if (config.destinationFile) {
        transports.push(
            new winston.transports.File({
                filename: config.destinationFile,
                format: config.useJsonFormat ? winston.format.json() : winston.format.simple()
            })
        );
    }

    winston.configure({
        level: config.level,
        handleExceptions: true,
        transports
    });

    winston.info(`Logger configured with level=${config.level}`);
}

// Default logger configuration, for testing and to avoid errors if not configured
configureLogger(loggerConfig);

// Avoid to much dependency from winston if not necessary for now
export const logger = winston as ILogger;
