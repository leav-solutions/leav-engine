// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Client} from '@elastic/elasticsearch';
import {mockMessage} from '__tests__/mocks/message';
import {writeData} from './elasticsearchService';

describe('elasticsearchService', () => {
    test('writeData on new index', async () => {
        const mockClient = {
            indices: {
                create: jest.fn(() => Promise.resolve()),
                exists: jest.fn(() => Promise.resolve(false))
            },
            index: jest.fn(() => Promise.resolve())
        } as unknown as Client;

        await writeData('indexName', {...mockMessage, ...mockMessage.payload}, mockClient);

        expect(mockClient.indices.exists).toHaveBeenCalled();
        expect(mockClient.indices.create).toHaveBeenCalled();
        expect(mockClient.index).toHaveBeenCalled();
    });

    test('writeData on existing index', async () => {
        const mockClient = {
            indices: {
                create: jest.fn(() => Promise.resolve()),
                exists: jest.fn(() => Promise.resolve(true))
            },
            index: jest.fn(() => Promise.resolve())
        } as unknown as Client;

        await writeData('indexName', {...mockMessage, ...mockMessage.payload}, mockClient);

        expect(mockClient.indices.exists).toHaveBeenCalled();
        expect(mockClient.indices.create).not.toHaveBeenCalled();
        expect(mockClient.index).toHaveBeenCalled();
    });
});
