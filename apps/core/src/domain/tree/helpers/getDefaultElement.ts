// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import {ITreeNode} from '_types/tree';
import {ECacheType, ICachesService} from '../../../infra/cache/cacheService';

interface IDeps {
    'core.infra.tree'?: ITreeRepo;
    'core.infra.cache.cacheService'?: ICachesService;
    'core.utils'?: IUtils;
}

export type GetDefaultElementFunc = (params: {treeId: string; ctx: any}) => Promise<ITreeNode>;

export interface IGetDefaultElementHelper {
    getDefaultElement: GetDefaultElementFunc;
    clearCache: (params: {treeId: string; ctx: any}) => Promise<void>;
}

export default function ({
    'core.infra.tree': treeRepo = null,
    'core.infra.cache.cacheService': cacheService = null,
    'core.utils': utils = null
}: IDeps): IGetDefaultElementHelper {
    const _getCacheKey = treeId => `${utils.getCoreEntityCacheKey('tree', treeId)}:defaultElement`;

    return {
        async getDefaultElement({treeId, ctx}) {
            const _execute = async () => {
                // TODO Change this behavior
                // for now, get first element in tree
                const treeContent = await treeRepo.getTreeContent({treeId, ctx});
                return treeContent?.[0] ?? null;
            };

            return cacheService.memoize<ITreeNode>({key: _getCacheKey(treeId), func: _execute, ctx});
        },
        async clearCache({treeId, ctx}) {
            const cacheKey = _getCacheKey(treeId);
            const cache = cacheService.getCache(ECacheType.RAM);
            cache.deleteData([cacheKey]);
        }
    };
}
