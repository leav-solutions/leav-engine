// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as winston from 'winston';
import {type ILoggerConfig, defaultLoggerConfig} from './config';

export type ILogger = Pick<typeof winston, 'error' | 'warn' | 'info' | 'log' | 'verbose' | 'debug' | 'silly'>;

export function configureLogger(config: ILoggerConfig): void {
    const level = config.level ?? defaultLoggerConfig.level;
    const useJsonFormat = config.useJsonFormat ?? defaultLoggerConfig.useJsonFormat;
    const destinationFile = config.destinationFile ?? defaultLoggerConfig.destinationFile;
    const onErrorLog = config.onErrorLog;

    const transports: winston.transport[] = [
        new winston.transports.Console({
            format: useJsonFormat
                ? winston.format.json()
                : winston.format.combine(winston.format.colorize(), winston.format.simple())
        })
    ];
    if (destinationFile) {
        transports.push(
            new winston.transports.File({
                filename: destinationFile,
                format: useJsonFormat ? winston.format.json() : winston.format.simple()
            })
        );
    }

    let catchErrorLog: winston.Logform.FormatWrap | null = null;

    if (typeof onErrorLog === 'function') {
        catchErrorLog = winston.format(info => {
            if (info.level === 'error') {
                const meta = {...info, level: undefined, message: undefined, splat: undefined};
                onErrorLog(info.message as string, meta);
            }
            return info;
        });
    }

    winston.configure({
        level,
        handleExceptions: true,
        transports,
        format: catchErrorLog?.()
    });

    winston.info(`Logger configured with level=${config.level}`);
}

// Default logger configuration, for testing and to avoid errors if not configured
configureLogger(defaultLoggerConfig);

// Avoid to much dependency from winston if not necessary for now
export const logger = winston as ILogger;
