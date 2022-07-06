// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import automate from '../../automate';
import * as events from '../../events';
import * as scan from '../../scan';
import {database, filesystem} from './scan';
import {IAmqpService} from '@leav/message-broker';

jest.mock('../../events', () => ({
    create: jest.fn(),
    move: jest.fn()
}));

let amqp;

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

beforeAll(async () => {
    try {
        jest.spyOn(console, 'info').mockImplementation(() => {
            return;
        });

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
            const move = jest.spyOn(events, 'move');

            await expect(automate(filesystem, database, amqp as IAmqpService)).resolves.toStrictEqual(undefined);

            expect(create).toHaveBeenCalledTimes(1);
            expect(move).toHaveBeenCalledTimes(1);
        } catch (e) {
            console.error(e);
        }
    });
});
