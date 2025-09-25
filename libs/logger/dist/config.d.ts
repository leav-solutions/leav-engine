export interface ILoggerConfig {
    /**
     * Log level (error, warn, info, log, verbose, debug, silly)
     * @default info
     */
    level: string;
    /**
     * If true, disable all logging
     * Default: true if TS_JEST=1 (tests), false otherwise
     */
    silent?: boolean;
    /**
     * If transport is file, destination file path
     */
    destinationFile?: string;
    /**
     * If true, use json format for logging, both in console and file
     * Default: false (plain text)
     */
    useJsonFormat?: boolean;
    onErrorLog?: (message: string, meta: any) => void;
}
export declare function envToBool(value: string, defaultValue?: boolean): boolean;
export declare const defaultLoggerConfig: ILoggerConfig;
