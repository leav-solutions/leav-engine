// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LoggerCallStack} from './LoggerCallStack';
import winston from 'winston';

const callStackForLocationInfo = new LoggerCallStack();
export const addLocationInfoInLog = winston.format(info => {
    const location = callStackForLocationInfo.getLocationInfo();
    if (location) {
        // Not effective for first call from configureLogger, but minor issue
        info.location = `${location.path}:${location.line}`;
    }
    return info;
});
