// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICachesService} from 'infra/cache/cacheService';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import {ITreeNode} from '_types/tree';
import {mockCtx} from '../../../__tests__/mocks/shared';
import getDefaultElement from './getDefaultElement';

describe('getDefaultElementId', () => {
    test('Return default element', async () => {
        const mockTreeNode: ITreeNode = {
            id: '1'
        };

        const mockTreeRepo: Mockify<ITreeRepo> = {
            getTreeContent: global.__mockPromise([mockTreeNode])
        };

        const mockCacheService: Mockify<ICachesService> = {
            memoize: jest.fn().mockImplementation(({func}) => func())
        };

        const mockUtils: Mockify<IUtils> = {
            getCoreEntityCacheKey: jest.fn().mockReturnValue('cacheKey')
        };

        const helper = getDefaultElement({
            'core.infra.tree': mockTreeRepo as ITreeRepo,
            'core.infra.cache.cacheService': mockCacheService as ICachesService,
            'core.utils': mockUtils as IUtils
        });

        const defaultElement = await helper.getDefaultElement({
            treeId: 'test_tree',
            ctx: mockCtx
        });

        expect(defaultElement).toEqual(mockTreeNode);
    });
});
