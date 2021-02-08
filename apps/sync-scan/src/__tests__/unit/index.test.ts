// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ConfirmChannel, Connection} from 'amqplib';
import automate from '../../automate';
import * as events from '../../rmq/events';
import * as scan from '../../scan';
import {IRMQConn} from '../../_types/rmq';
import {database, filesystem} from './scan';

jest.mock('../../rmq/events', () => ({
    create: jest.fn(),
    move: jest.fn()
}));

let rmqConn: IRMQConn;

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

        rmqConn = {
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

            await expect(automate(filesystem, database, rmqConn.channel)).resolves.toStrictEqual(undefined);

            expect(create).toHaveBeenCalledTimes(1);
            expect(move).toHaveBeenCalledTimes(1);
        } catch (e) {
            console.error(e);
        }
    });
});
