// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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

// duplicate of libs/config-manager/src/envTo.ts
// to avoid adding this dependency here for now
export function envToBool(value: string, defaultValue = false) {
    const v = value?.trim().toLowerCase();
    if (v === 'true' || v === '1' || v === 'yes') {
        return true;
    }
    if (v === 'false' || v === '0' || v === 'no') {
        return false;
    }
    return defaultValue;
}

export const defaultLoggerConfig: ILoggerConfig = {
    level: process.env.LOG_LEVEL || 'info',
    silent: envToBool(process.env.LOG_SILENT, process.env.TS_JEST === '1'),
    destinationFile: process.env.LOG_FILE,
    useJsonFormat: envToBool(process.env.LOG_USE_JSON_FORMAT, false)
};
