import {LoggerCallStack} from './LoggerCallStack';
import winston from 'winston';

export function catchErrorFormatter(
    onErrorLog?: (message: string, meta: any, getCallStackTrace: () => string) => void,
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
                    splat: undefined,
                };

                onErrorLog(info.message as string, meta, () => callStackForErrorStack.getCallStackTrace() || '');
            }
            return info;
        });
    }

    return null;
}
