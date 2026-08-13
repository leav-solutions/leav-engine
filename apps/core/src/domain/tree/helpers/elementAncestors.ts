import {type ITreeDomain} from '../treeDomain';
import {type ITreeRepo} from '../../../infra/tree/treeRepo';
import {ECacheType, type ICachesService} from '../../../infra/cache/cacheService';

interface IDeps {
    'core.infra.tree': ITreeRepo;
    'core.infra.cache.cacheService': ICachesService;
}

export interface IElementAncestorsHelper {
    getCachedElementAncestors: ITreeDomain['getElementAncestors'];
    clearElementAncestorsCache: (params: {treeId: string; ctx: any}) => Promise<void>;
}

export default function ({
    'core.infra.tree': treeRepo,
    'core.infra.cache.cacheService': cacheService,
}: IDeps): IElementAncestorsHelper {
    const _getCacheKey = (treeId: string, nodeId?: string): string => `elementAncestors:${treeId}:${nodeId ?? '*'}`;

    return {
        getCachedElementAncestors: async ({treeId, nodeId, ctx}) => {
            const _execute = async () => treeRepo.getElementAncestors({treeId, nodeId, ctx});

            const cacheKey = _getCacheKey(treeId, nodeId);
            return cacheService.memoize({key: cacheKey, func: _execute, ctx});
        },
        clearElementAncestorsCache: async ({treeId}) => {
            const cacheKey = _getCacheKey(treeId);
            const cache = cacheService.getCache(ECacheType.RAM);
            cache.deleteData([cacheKey]);
        },
    };
}
