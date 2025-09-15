export interface ILoggerConfig {
    /**
     * Log level (error, warn, info, log, verbose, debug, silly)
     * @default info
     */
    level: string;
    /**
     * If transport is file, destination file path
     */
    destinationFile?: string;
    /**
     * If true, use json format for logging, both in console and file
     * Default: false (plain text)
     */
    useJsonFormat?: boolean;
}
export declare function envToBool(value: string, defaultValue?: boolean): boolean;
export declare const loggerConfig: ILoggerConfig;
