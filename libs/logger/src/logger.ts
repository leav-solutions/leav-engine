// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import winston from 'winston';
import {type ILoggerConfig, defaultLoggerConfig} from './config';
import {addLocationInfoInLog} from './locationInfoFormatter';
import {catchErrorFormatter} from './catchErrorFormatter';

export type ILogger = Pick<typeof winston, 'error' | 'warn' | 'info' | 'log' | 'verbose' | 'debug' | 'silly'>;

export function configureLogger(config: ILoggerConfig): void {
    const level = config.level ?? defaultLoggerConfig.level;
    const useJsonFormat = config.useJsonFormat ?? defaultLoggerConfig.useJsonFormat;
    const destinationFile = config.destinationFile ?? defaultLoggerConfig.destinationFile;
    const addLocationInfo = config.addLocationInfo ?? defaultLoggerConfig.addLocationInfo;
    const addTimestamp = config.addTimestamp ?? defaultLoggerConfig.addTimestamp;
    const additionalMeta = config.additionalMeta ?? defaultLoggerConfig.additionalMeta;
    const onErrorLog = config.onErrorLog;

    const transports: winston.transport[] = [
        new winston.transports.Console({
            silent: config.silent,
            format: useJsonFormat
                ? winston.format.json()
                : winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
    ];
    if (destinationFile) {
        transports.push(
            new winston.transports.File({
                filename: destinationFile,
                format: useJsonFormat ? winston.format.json() : winston.format.combine(winston.format.simple()),
            }),
        );
    }

    const catchErrorLog = catchErrorFormatter(onErrorLog);

    const formats = [
        catchErrorLog ? catchErrorLog() : undefined,
        addLocationInfo ? addLocationInfoInLog() : undefined,
        addTimestamp ? winston.format.timestamp() : undefined,
    ].filter(f => !!f) as winston.Logform.Format[];

    winston.configure({
        level,
        handleExceptions: true,
        transports,
        defaultMeta: additionalMeta,
        format: winston.format.combine(...formats),
    });
}

// Default logger configuration, for testing and to avoid errors if not configured
configureLogger(defaultLoggerConfig);

// Avoid to much dependency from winston if not necessary for now
export const logger = winston as ILogger;
