// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ConfirmChannel, Connection} from 'amqplib';
import automate from '../../automate';
import * as events from '../../amqp/events';
import * as scan from '../../scan';
import {IAmqpConn} from '../../_types/amqp';
import {database, filesystem} from './scan';

jest.mock('../../amqp/events', () => ({
    create: jest.fn(),
    move: jest.fn()
}));

let amqpConn: IAmqpConn;

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

beforeAll(async () => {
    try {
        jest.spyOn(console, 'info').mockImplementation(() => {
            return;
        });

        const mockChannel = {
            publish: jest.fn()
        };

        const mockConnection = {
            close: jest.fn()
        };

        amqpConn = {
            channel: (mockChannel as unknown) as ConfirmChannel,
            connection: (mockConnection as unknown) as Connection
        };
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

            await expect(automate(filesystem, database, amqpConn)).resolves.toStrictEqual(undefined);

            expect(create).toHaveBeenCalledTimes(1);
            expect(move).toHaveBeenCalledTimes(1);
        } catch (e) {
            console.error(e);
        }
    });
});
