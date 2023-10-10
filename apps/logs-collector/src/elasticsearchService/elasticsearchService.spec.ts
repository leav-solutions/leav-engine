// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Client} from '@elastic/elasticsearch';
import {mockMessage} from '__tests__/mocks/message';
import {writeData} from './elasticsearchService';

describe('elasticsearchService', () => {
    test('writeData', async () => {
        const mockClient = ({
            indices: {
                create: jest.fn(() => Promise.resolve())
            },
            index: jest.fn(() => Promise.resolve())
        } as unknown) as Client;

        await writeData('indexName', {...mockMessage, ...mockMessage.payload}, mockClient);

        expect(mockClient.indices.create).toHaveBeenCalled();
        expect(mockClient.index).toHaveBeenCalled();
    });
});
