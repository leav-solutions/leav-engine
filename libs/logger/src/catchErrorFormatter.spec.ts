// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import winston from 'winston';
import {catchErrorFormatter} from './catchErrorFormatter';

describe('catchErrorFormatter', () => {
    const fakeFormat = winston.format(info => info)();

    const initialErrorStackTraceLimit = Error.stackTraceLimit;
    beforeEach(() => {
        Error.stackTraceLimit = 10; // default in prod
        jest.resetAllMocks();
    });

    afterAll(() => {
        Error.stackTraceLimit = initialErrorStackTraceLimit;
    });

    it('should return null if onErrorLog is not a function', () => {
        expect(catchErrorFormatter()).toBeNull();
    });

    it('should call onErrorLog when logging an error and getCallStackTrace should return stack from caller', () => {
        const onErrorLog = jest.fn().mockImplementation((message, meta, getCallStackTrace) => getCallStackTrace());
        const format = catchErrorFormatter(onErrorLog);
        expect(format).toBeDefined();

        const logger = winston.createLogger({
            level: 'error',
            format: format(),
            transports: [new winston.transports.Console({silent: true})]
        });

        logger.error('Test error', {foo: 'bar'});

        expect(onErrorLog).toHaveBeenCalledTimes(1);
        const [message, meta] = onErrorLog.mock.calls[0];
        expect(message).toBe('Test error');
        expect(meta.foo).toBe('bar');
        const callStack = onErrorLog.mock.results[0];
        expect(callStack.value.split('\n')[0]).toMatch(new RegExp(`\\(${__filename}:\\d+:\\d+\\)`));
    });

    it('should call onErrorLog when logging twice an error and getCallStackTrace should return each stack', () => {
        const onErrorLog = jest.fn().mockImplementation((message, meta, getCallStackTrace) => getCallStackTrace());

        const logger = winston.createLogger({
            level: 'error',
            format: catchErrorFormatter(onErrorLog)(),
            transports: [new winston.transports.Console({silent: true})]
        });

        logger.error('Test error 1');
        logger.error('Test error 2');

        expect(onErrorLog).toHaveBeenCalledTimes(2);
        const [message1] = onErrorLog.mock.calls[0];
        expect(message1).toBe('Test error 1');
        const callStack1 = onErrorLog.mock.results[0];
        expect(callStack1.value.split('\n')[0]).toMatch(/at Object.* \(.*catchErrorFormatter\.spec\.ts:\d+:\d+\)/);

        const [message2] = onErrorLog.mock.calls[1];
        expect(message2).toBe('Test error 2');
        const callStack2 = onErrorLog.mock.results[1];
        expect(callStack2.value.split('\n')[0]).toMatch(/at Object.* \(.*catchErrorFormatter\.spec\.ts:\d+:\d+\)/);

        expect(callStack1.value.split('\n')[0]).not.toBe(callStack2.value.split('\n')[0]);
    });

    it('should not call onErrorLog for non-error levels', () => {
        const onErrorLog = jest.fn();
        const format = catchErrorFormatter(onErrorLog);

        const logger = winston.createLogger({
            level: 'info',
            format: format(),
            transports: [new winston.transports.Console({silent: true})]
        });

        logger.info('Test info');
        expect(onErrorLog).not.toHaveBeenCalled();
    });
});
