// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
