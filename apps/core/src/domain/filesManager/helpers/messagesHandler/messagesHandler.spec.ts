// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IConfig} from '_types/config';
import {FileEvents, IFileEventData} from '../../../../_types/filesManager';
import {mockCtx} from '../../../../__tests__/mocks/shared';
import * as handleFileSystem from '../handleFileSystem';
import messagesHandler from './messagesHandler';

describe('MessagesHandler', () => {
    test('Process messages, respect incoming order', async () => {
        const mockHandleEventFileSystem = jest.fn();
        jest.spyOn(handleFileSystem, 'handleEventFileSystem').mockImplementation(mockHandleEventFileSystem);

        const mockConfig = {
            filesManager: {
                rootKeys: {
                    files1: 'files'
                }
            }
        };

        const handler = messagesHandler({
            config: mockConfig as IConfig
        });

        const mockMessage: IFileEventData = {
            event: FileEvents.CREATE,
            inode: 0,
            isDirectory: false,
            pathAfter: '/path/to/file/1',
            pathBefore: '',
            rootKey: 'root_key',
            time: 123456789,
            hash: 'hash'
        };

        try {
            handler.handleMessage({...mockMessage, inode: 1}, mockCtx);
            handler.handleMessage({...mockMessage, inode: 2}, mockCtx);
            handler.handleMessage({...mockMessage, inode: 3}, mockCtx);
            handler.handleMessage({...mockMessage, inode: 4}, mockCtx);
            handler.handleMessage({...mockMessage, inode: 5}, mockCtx);
        } catch (e) {
            console.error(e);
        }

        // Actual messages processing is asynchronous. Just wait a little to make sure it's done.
        await new Promise(resolve => setTimeout(resolve, 50));

        expect(mockHandleEventFileSystem).toHaveBeenCalledTimes(5);
        expect(mockHandleEventFileSystem.mock.calls[0][0].inode).toBe(1);
        expect(mockHandleEventFileSystem.mock.calls[1][0].inode).toBe(2);
        expect(mockHandleEventFileSystem.mock.calls[2][0].inode).toBe(3);
        expect(mockHandleEventFileSystem.mock.calls[3][0].inode).toBe(4);
        expect(mockHandleEventFileSystem.mock.calls[4][0].inode).toBe(5);
    });
});
