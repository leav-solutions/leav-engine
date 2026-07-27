import {type IAmqpChannel} from '@leav/message-broker';
import automate, {extractChildrenDbElements} from '../../automate';
import * as events from '../../events';
import * as scan from '../../scan';
import {mockDbResult, mockFsContent, mockDbSettings} from './scan';

vi.mock('../../events', () => ({
    create: vi.fn(),
    move: vi.fn(),
    update: vi.fn(),
}));

let amqp;

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

beforeAll(async () => {
    try {
        vi.spyOn(console, 'info').mockImplementation(() => null);

        const mockAmqp = {
            publish: vi.fn(),
            close: vi.fn(),
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

            const create = vi.spyOn(events, 'create');
            const update = vi.spyOn(events, 'update');

            const dbScan = extractChildrenDbElements(mockDbSettings, mockDbResult.treeContent);

            await expect(automate(mockFsContent, dbScan, mockDbSettings, amqp as IAmqpChannel)).resolves.toStrictEqual(
                undefined,
            );

            expect(create).toHaveBeenCalledTimes(1);
            expect(update).toHaveBeenCalledTimes(1);
        } catch (e) {
            console.error(e);
        }
    });
});
