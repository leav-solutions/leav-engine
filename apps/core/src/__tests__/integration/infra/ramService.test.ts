// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {getCoreDep} from './integrationTestRepoUtils';
import {ECacheType, type ICacheService, type ICachesService} from '../../../infra/cache/cacheService';

describe('infra/cache/ramService integration', () => {
    let ramService: ICacheService;

    beforeAll(async () => {
        ramService = getCoreDep<ICachesService>('core.infra.cache.cacheService').getCache(ECacheType.RAM);
    });

    beforeEach(async () => {
        await ramService.deleteAll();
    });

    it('storeData and getData should write and read values', async () => {
        await ramService.storeData({key: 'k1', data: 'v1', expiresIn: 1000});
        await ramService.storeData({key: 'k2', data: 'v2'});

        const res = await ramService.getData(['k1', 'k2', 'k3']);
        expect(res).toEqual(['v1', 'v2', null]);
    });

    it('deleteData should delete exact keys', async () => {
        await ramService.storeData({key: 'k1', data: 'v1'});
        await ramService.storeData({key: 'k2', data: 'v2'});

        await ramService.deleteData(['k1']);
        const res = await ramService.getData(['k1', 'k2']);
        expect(res).toEqual([null, 'v2']);
    });

    it('deleteData should delete keys matching patterns without touching others', async () => {
        await Promise.all([
            ramService.storeData({key: 'user:1', data: 'a'}),
            ramService.storeData({key: 'user:2', data: 'b'}),
            ramService.storeData({key: 'user:3', data: 'c'}),
            ramService.storeData({key: 'session:1', data: 's1'}),
            ramService.storeData({key: 'session:2', data: 's2'}),
        ]);

        await ramService.deleteData(['user:*']);

        const res = await ramService.getData(['user:1', 'user:2', 'user:3', 'session:1', 'session:2']);
        expect(res).toEqual([null, null, null, 's1', 's2']);
    });

    it('deleteData should handle mixed exact and pattern keys', async () => {
        await Promise.all([
            ramService.storeData({key: 'a', data: '1'}),
            ramService.storeData({key: 'b', data: '2'}),
            ramService.storeData({key: 'foo:1', data: 'x'}),
            ramService.storeData({key: 'foo:2', data: 'y'}),
            ramService.storeData({key: 'bar:1', data: 'z'}),
        ]);

        await ramService.deleteData(['a', 'foo:*']);

        const res = await ramService.getData(['a', 'b', 'foo:1', 'foo:2', 'bar:1']);
        expect(res).toEqual([null, '2', null, null, 'z']);
    });

    it('deleteAll should flush the DB', async () => {
        await Promise.all([ramService.storeData({key: 'x', data: '1'}), ramService.storeData({key: 'y', data: '2'})]);

        await ramService.deleteAll();

        const res = await ramService.getData(['x', 'y']);
        expect(res).toEqual([null, null]);
    });

    it('deleteData should respect ? wildcard (single char)', async () => {
        await Promise.all([
            ramService.storeData({key: 'user:1', data: 'a1'}),
            ramService.storeData({key: 'user:2', data: 'a2'}),
            ramService.storeData({key: 'user:a', data: 'aa'}),
            ramService.storeData({key: 'user:10', data: 'b'}),
            ramService.storeData({key: 'user:xyz', data: 'c'}),
        ]);

        await ramService.deleteData(['user:?']);

        const res = await ramService.getData(['user:1', 'user:2', 'user:a', 'user:10', 'user:xyz']);
        expect(res).toEqual([null, null, null, 'b', 'c']);
    });

    it('deleteData should support bracket character sets', async () => {
        await Promise.all([
            ramService.storeData({key: 'user:1', data: 'v1'}),
            ramService.storeData({key: 'user:2', data: 'v2'}),
            ramService.storeData({key: 'user:3', data: 'v3'}),
            ramService.storeData({key: 'user:a', data: 'va'}),
        ]);

        await ramService.deleteData(['user:[12]']);

        const res = await ramService.getData(['user:1', 'user:2', 'user:3', 'user:a']);
        expect(res).toEqual([null, null, 'v3', 'va']);
    });

    it('deleteData should handle overlapping patterns combined with exact keys', async () => {
        await Promise.all([
            ramService.storeData({key: 'logs:2025-10-09', data: 'L1'}),
            ramService.storeData({key: 'logs:2025-10-08', data: 'L2'}),
            ramService.storeData({key: 'logs:2024-12-31', data: 'L3'}),
            ramService.storeData({key: 'session:1', data: 'S1'}),
            ramService.storeData({key: 'session:2', data: 'S2'}),
            ramService.storeData({key: 'config', data: 'C'}),
        ]);

        await ramService.deleteData(['logs:2025-*', 'session:1', 'config']);

        const res = await ramService.getData([
            'logs:2025-10-09',
            'logs:2025-10-08',
            'logs:2024-12-31',
            'session:1',
            'session:2',
            'config',
        ]);
        expect(res).toEqual([null, null, 'L3', null, 'S2', null]);
    });

    it('deleteData should not fail when no keys match patterns', async () => {
        await Promise.all([
            ramService.storeData({key: 'item:1', data: 'I1'}),
            ramService.storeData({key: 'item:2', data: 'I2'}),
        ]);

        await ramService.deleteData(['nonexistent:*', 'anothermissing?']);

        const res = await ramService.getData(['item:1', 'item:2']);
        expect(res).toEqual(['I1', 'I2']);
    });
});
