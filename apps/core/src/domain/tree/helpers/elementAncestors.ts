// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITreeDomain} from 'domain/tree/treeDomain';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {ECacheType, ICachesService} from '../../../infra/cache/cacheService';

interface IDeps {
    'core.infra.tree'?: ITreeRepo;
    'core.infra.cache.cacheService'?: ICachesService;
}

export interface IElementAncestorsHelper {
    getCachedElementAncestors: ITreeDomain['getElementAncestors'];
    clearElementAncestorsCache: (params: {treeId: string; ctx: any}) => Promise<void>;
}

export default function ({
    'core.infra.tree': treeRepo = null,
    'core.infra.cache.cacheService': cacheService = null
}: IDeps): IElementAncestorsHelper {
    const _getCacheKey = (treeId: string, nodeId?: string): string => `elementAncestors:${treeId}:${nodeId ?? '*'}`;

    return {
        getCachedElementAncestors: async ({treeId, nodeId, ctx}) => {
            const _execute = async () => treeRepo.getElementAncestors({treeId, nodeId, ctx});

            const cacheKey = _getCacheKey(treeId, nodeId);
            return cacheService.memoize({key: cacheKey, func: _execute, ctx});
        },
        clearElementAncestorsCache: async ({treeId, ctx}) => {
            const cacheKey = _getCacheKey(treeId);
            const cache = cacheService.getCache(ECacheType.RAM);
            cache.deleteData([cacheKey]);
        }
    };
}
