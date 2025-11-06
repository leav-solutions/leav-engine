// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import winston from 'winston';
import {addLocationInfoInLog} from './locationInfoFormatter';

describe('addLocationInfo', () => {
    const fakeFormat = winston.format(info => info)();
    const fakeFormatTransformSpy = jest.spyOn(fakeFormat, 'transform');

    const initialErrorStackTraceLimit = Error.stackTraceLimit;
    beforeEach(() => {
        Error.stackTraceLimit = 10; // default in prod
        jest.resetAllMocks();
    });

    afterAll(() => {
        Error.stackTraceLimit = initialErrorStackTraceLimit;
    });

    it('addLocationInfoInLog should add location property to log info', () => {
        const logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(addLocationInfoInLog(), fakeFormat),
            transports: [new winston.transports.Console({silent: true})],
        });

        logger.info('Test log');

        expect(fakeFormatTransformSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                level: 'info',
                message: 'Test log',
                location: expect.stringMatching(new RegExp(`${__filename}:\\d+`)),
            }),
            {},
        );
    });

    it('addLocationInfoInLog should work several times', () => {
        const logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(addLocationInfoInLog(), fakeFormat),
            transports: [new winston.transports.Console({silent: true})],
        });

        logger.info('Test log 1');
        logger.info('Test log 2');

        expect(fakeFormatTransformSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                level: 'info',
                message: 'Test log 1',
                location: expect.stringMatching(new RegExp(`${__filename}:\\d+`)),
            }),
            {},
        );
        expect(fakeFormatTransformSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                level: 'info',
                message: 'Test log 2',
                location: expect.stringMatching(new RegExp(`${__filename}:\\d+`)),
            }),
            {},
        );
    });
});
