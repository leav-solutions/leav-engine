// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import winston from 'winston';
import {type ILoggerConfig, defaultLoggerConfig} from './config';
import {addLocationInfoInLog} from './locationInfoFormatter';
import {catchErrorFormatter} from './catchErrorFormatter';

// This type prevents adding message and other properties in meta objects to avoid conflict in log output
type MetaWithoutLoggerProperties = {
    [key: string]: unknown;
} & {
    message?: never;
    level?: never;
    timestamp?: never;
    location?: never;
    env?: never;
    app?: never;
    client?: never;
    version?: never;
};

export interface ILogger {
    error(message: string, ...meta: MetaWithoutLoggerProperties[]): void;
    warn(message: string, ...meta: MetaWithoutLoggerProperties[]): void;
    info(message: string, ...meta: MetaWithoutLoggerProperties[]): void;
    verbose(message: string, ...meta: MetaWithoutLoggerProperties[]): void;
    debug(message: string, ...meta: MetaWithoutLoggerProperties[]): void;
    silly(message: string, ...meta: MetaWithoutLoggerProperties[]): void;
}

const winstonDefaultLogger = winston.createLogger();

export function configureLogger(config: ILoggerConfig): void {
    const level = config.level ?? defaultLoggerConfig.level;
    const useJsonFormat = config.useJsonFormat ?? defaultLoggerConfig.useJsonFormat;
    const destinationFile = config.destinationFile ?? defaultLoggerConfig.destinationFile;
    const addLocationInfo = config.addLocationInfo ?? defaultLoggerConfig.addLocationInfo;
    const addTimestamp = config.addTimestamp ?? defaultLoggerConfig.addTimestamp;
    const additionalMeta = config.additionalMeta ?? defaultLoggerConfig.additionalMeta;
    const onErrorLog = config.onErrorLog;

    // Metadata format to separate metadata fields from main log info
    const metadataFormat = winston.format.metadata({
        key: 'metadata',
        fillExcept: ['message', 'level', 'timestamp', 'env', 'app', 'client', 'version', 'location'],
    });

    const transports: winston.transport[] = [
        new winston.transports.Console({
            silent: config.silent,
            format: useJsonFormat
                ? winston.format.combine(metadataFormat, winston.format.json())
                : winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
    ];
    if (destinationFile) {
        transports.push(
            new winston.transports.File({
                filename: destinationFile,
                format: useJsonFormat
                    ? winston.format.combine(metadataFormat, winston.format.json())
                    : winston.format.simple(),
            }),
        );
    }

    const catchErrorLog = catchErrorFormatter(onErrorLog);
    const addLocationInfoFormat = addLocationInfo
        ? addLocationInfoInLog(_level => winstonDefaultLogger.isLevelEnabled(_level))
        : null;

    const formats = [
        catchErrorLog ? catchErrorLog() : undefined,
        addLocationInfoFormat ? addLocationInfoFormat() : undefined,
        addTimestamp ? winston.format.timestamp() : undefined,
    ].filter(f => !!f) as winston.Logform.Format[];

    winstonDefaultLogger.configure({
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
export const logger = winstonDefaultLogger as ILogger;
