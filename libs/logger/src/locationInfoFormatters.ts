// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import winston from 'winston';

const winstonCallRegExp = new RegExp('node_modules/winston/lib/winston');

// Matches lines like: at Object.<anonymous> (path:line:col) or at path:line:col
const stackTraceLineRegExp = new RegExp('.* \\(?(?<path>.*):(?<line>[0-9]+):(?<col>[0-9]+)');

interface ICallerInfo {
    path: string;
    line: string;
    col: string;
}

// Cache the index in stack of caller line to avoid to much processing
// Should not change during the process lifetime
let callerLineIndexInStack = 0;

export function getLocationInfo(): ICallerInfo | null {
    const stack = new Error().stack;
    if (!stack) {
        return null;
    }
    const stackLines = stack.split('\n');

    // First try with the last known index
    if (stackLines.length > callerLineIndexInStack) {
        const theLine = stackLines[callerLineIndexInStack];
        const matchLine = theLine.match(stackTraceLineRegExp);
        if (matchLine?.groups) {
            return matchLine.groups as unknown as ICallerInfo;
        }
    }

    const reversedStackLines = stackLines.reverse();

    // Search the first winston call in the stack
    // Start at index 1 because first line may the effective caller
    for (let i = 1; i < reversedStackLines.length; i++) {
        const matchWinstonCall = reversedStackLines[i].match(winstonCallRegExp);
        if (matchWinstonCall) {
            // The previous line is the caller
            const matchLine = reversedStackLines[i - 1].match(stackTraceLineRegExp);
            if (matchLine?.groups) {
                callerLineIndexInStack = reversedStackLines.length - i;
                return matchLine.groups as unknown as ICallerInfo;
            }
        }
    }
    return null;
}

export const addLocationInfoInLog = winston.format(info => {
    const location = getLocationInfo();
    if (location) {
        // Not effective for first call from configureLogger, but minor issue
        info.location = `${location.path}:${location.line}`;
    }
    return info;
});

export const mergeLocationInfoInLog = winston.format(info => {
    info.message = `[${info.location}] ${info.message}`;
    delete info.location;
    return info;
});
