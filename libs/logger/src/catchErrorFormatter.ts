// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LoggerCallStack} from './LoggerCallStack';
import winston from 'winston';

export function catchErrorFormatter(
    onErrorLog?: (message: string, meta: any, getCallStackTrace: () => string) => void
): winston.Logform.FormatWrap | null {
    if (typeof onErrorLog === 'function') {
        const callStackForErrorStack = new LoggerCallStack();
        return winston.format(info => {
            if (info.level === 'error') {
                const meta = {
                    ...info,
                    app: undefined,
                    client: undefined,
                    env: undefined,
                    version: undefined,
                    level: undefined,
                    message: undefined,
                    splat: undefined
                };

                onErrorLog(info.message as string, meta, () => callStackForErrorStack.getCallStackTrace() || '');
            }
            return info;
        });
    }

    return null;
}
