import {Mockify} from '@leav/utils';
import {ICacheService, ICachesService} from '../../infra/cache/cacheService';

export const mockCacheService: Mockify<ICacheService> = {
    getData: global.__mockPromise([null]),
    storeData: global.__mockPromise(),
    deleteData: global.__mockPromise()
};

export const mockCachesService: Mockify<ICachesService> = {
    getCache: jest.fn().mockReturnValue(mockCacheService),
    memoize: jest.fn().mockImplementation(({func}) => func())
};
