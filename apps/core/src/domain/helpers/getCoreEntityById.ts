import {type IAttributeRepo} from '../../infra/attribute/attributeRepo';
import {type ILibraryRepo} from '../../infra/library/libraryRepo';
import {type ITreeRepo} from '../../infra/tree/treeRepo';
import {type IVersionProfileRepo} from '../../infra/versionProfile/versionProfileRepo';
import {type IViewRepo} from '../../infra/view/_types';
import {type IViewV2Repo} from '../../infra/viewV2/viewV2Repo';
import {type IUtils} from '../../utils/utils';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type ICachesService} from '../../infra/cache/cacheService';

interface IDeps {
    'core.infra.library': ILibraryRepo;
    'core.infra.attribute': IAttributeRepo;
    'core.infra.tree': ITreeRepo;
    'core.infra.view': IViewRepo;
    'core.infra.viewV2': IViewV2Repo;
    'core.infra.versionProfile': IVersionProfileRepo;
    'core.infra.cache.cacheService': ICachesService;
    'core.utils': IUtils;
}

export type GetCoreEntityByIdFunc = <T extends ICoreEntity>(
    entityType: 'library' | 'attribute' | 'tree' | 'view' | 'viewV2' | 'versionProfile',
    entityId: string,
    ctx: IQueryInfos,
) => Promise<T>;

export default function ({
    'core.infra.library': libraryRepo,
    'core.infra.attribute': attributeRepo,
    'core.infra.tree': treeRepo,
    'core.infra.view': viewRepo,
    'core.infra.viewV2': viewV2Repo,
    'core.infra.versionProfile': versionProfileRepo,
    'core.infra.cache.cacheService': cacheService,
    'core.utils': utils,
}: IDeps): GetCoreEntityByIdFunc {
    const getCoreEntityById = async function <T>(entityType, entityId, ctx): Promise<T> {
        const _execute = async () => {
            let result;
            switch (entityType) {
                case 'library':
                    result = await libraryRepo.getLibraries({
                        params: {filters: {id: entityId}, strictFilters: true},
                        ctx,
                    });
                    break;
                case 'attribute':
                    result = await attributeRepo.getAttributes({
                        params: {filters: {id: entityId}, strictFilters: true},
                        ctx,
                    });
                    break;
                case 'tree':
                    result = await treeRepo.getTrees({params: {filters: {id: entityId}, strictFilters: true}, ctx});
                    break;
                case 'view':
                    result = await viewRepo.getViews({filters: {id: entityId}, strictFilters: true}, ctx);
                    break;
                case 'versionProfile':
                    result = await versionProfileRepo.getVersionProfiles({
                        params: {filters: {id: entityId}, strictFilters: true},
                        ctx,
                    });
                    break;
                case 'viewV2':
                    result = await viewV2Repo.getViewsOwnedOrSharedV2(
                        {filters: {id: entityId}, strictFilters: true},
                        ctx,
                    );
                    break;
            }

            if (!result.list.length) {
                return null;
            }

            return result.list[0];
        };

        const cacheKey = utils.getCoreEntityCacheKey(entityType, entityId);

        // Due to race conditions, we sometimes get null when retrieving a newly created core entity. Thus, we don't
        // want to keep this "false" null in cache
        return cacheService.memoize({
            key: cacheKey,
            func: _execute,
            storeNulls: false,
            ctx,
        });
    };

    return getCoreEntityById;
}
