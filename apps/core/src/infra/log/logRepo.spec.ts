// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction} from '@leav/utils';
import {IElasticSearchService} from 'infra/elasticSearch/elasticSearchService';
import {IConfig} from '_types/config';
import {mockLog} from '../../__tests__/mocks/log';
import {mockCtx} from '../../__tests__/mocks/shared';
import logRepo from './logRepo';

describe('logRepo', () => {
    describe('getLogs', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        const mockESService: Mockify<IElasticSearchService> = {
            search: global.__mockPromise([mockLog])
        };

        const mockConfig: Partial<IConfig> = {
            instanceId: 'instanceId'
        };

        test('Read logs from ElasticSearch', async () => {
            const repo = logRepo({
                'core.infra.elasticSearch.service': mockESService as IElasticSearchService,
                config: mockConfig as IConfig
            });
            const logs = await repo.getLogs({}, mockCtx);

            expect(logs).toEqual([mockLog]);
            expect(mockESService.search).toHaveBeenCalled();
        });

        test('Convert filters to ES format', async () => {
            const repo = logRepo({
                'core.infra.elasticSearch.service': mockESService as IElasticSearchService,
                config: mockConfig as IConfig
            });
            const logs = await repo.getLogs(
                {
                    filters: {
                        userId: '1',
                        actions: [EventAction.VALUE_SAVE],
                        topic: {
                            library: 'my_lib',
                            attribute: 'my_attribute',
                            record: {
                                libraryId: 'my_lib',
                                id: '123456'
                            }
                        }
                    }
                },
                mockCtx
            );

            expect(logs).toEqual([mockLog]);
            expect(mockESService.search.mock.calls[0][0].query).toEqual({
                bool: {
                    must: [
                        {match: {userId: '1'}},
                        {terms: {action: [EventAction.VALUE_SAVE]}},
                        {match: {'topic.library': 'my_lib'}},
                        {match: {'topic.attribute': 'my_attribute'}},
                        {match: {'topic.record.libraryId': 'my_lib'}},
                        {match: {'topic.record.id': '123456'}}
                    ]
                }
            });
        });
    });
});
