import {type ICacheService, type ICachesService} from '../../infra/cache/cacheService';

export const mockCacheService: Mockify<ICacheService> = {
    getData: global.__mockPromise([null]),
    storeData: global.__mockPromise(),
    deleteData: global.__mockPromise(),
};

export const mockCachesService: Mockify<ICachesService> = {
    getCache: vi.fn().mockReturnValue(mockCacheService),
    memoize: vi.fn().mockImplementation(({func}) => func()),
};
