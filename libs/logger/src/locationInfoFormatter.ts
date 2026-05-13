import {LoggerCallStack} from './LoggerCallStack';
import winston from 'winston';

const callStackForLocationInfo = new LoggerCallStack();
export const addLocationInfoInLog = (isLogLevelEnabled: (level: string) => boolean) =>
    winston.format(info => {
        // if log level is not enabled, skip location info addition to avoid unnecessary call stack processing
        if (!isLogLevelEnabled(info.level)) {
            return info;
        }
        const location = callStackForLocationInfo.getLocationInfo();
        if (location) {
            // Not effective for first call from configureLogger, but minor issue
            info.location = `${location.path}:${location.line}`;
        }
        return info;
    });
