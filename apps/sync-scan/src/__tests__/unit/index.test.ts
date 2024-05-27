// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import automate, {extractChildrenDbElements} from '../../automate';
import * as events from '../../events';
import * as scan from '../../scan';
import {mockDbResult, mockFsContent, mockDbSettings} from './scan';

jest.mock('../../events', () => ({
    create: jest.fn(),
    move: jest.fn(),
    update: jest.fn()
}));

let amqp;

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

beforeAll(async () => {
    try {
        jest.spyOn(console, 'info').mockImplementation(() => null);

        const mockAmqp = {
            publish: jest.fn(),
            consume: jest.fn(),
            close: jest.fn()
        };

        amqp = mockAmqp;
    } catch (e) {
        console.error(e);
    }
});

describe('unit tests', () => {
    test('scan.getFilePath', async () => {
        try {
            expect.assertions(2);

            expect(scan.getFilePath('root/fs', 'root/fs')).toBe('.');
            expect(scan.getFilePath('root/fs/dir', 'root/fs')).toBe('dir');
        } catch (e) {
            console.error(e);
        }
    });

    test('scan.getFileLevel', async () => {
        try {
            expect.assertions(2);

            expect(scan.getFileLevel('.')).toBe(0);
            expect(scan.getFileLevel('dir')).toBe(1);
        } catch (e) {
            console.error(e);
        }
    });

    test('automate', async () => {
        try {
            expect.assertions(3);

            const create = jest.spyOn(events, 'create');
            const update = jest.spyOn(events, 'update');

            const dbScan = extractChildrenDbElements(mockDbSettings, mockDbResult.treeContent);

            await expect(automate(mockFsContent, dbScan, mockDbSettings, amqp as IAmqpService)).resolves.toStrictEqual(
                undefined
            );

            expect(create).toHaveBeenCalledTimes(1);
            expect(update).toHaveBeenCalledTimes(1);
        } catch (e) {
            console.error(e);
        }
    });
});
