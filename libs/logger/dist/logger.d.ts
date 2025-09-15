import * as winston from 'winston';
import { type ILoggerConfig } from './config';
export type ILogger = Pick<typeof winston, 'error' | 'warn' | 'info' | 'log' | 'verbose' | 'debug' | 'silly'>;
export declare function configureLogger(config: ILoggerConfig): void;
export declare const logger: ILogger;
