// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import DataLoader from 'dataloader';
import {type IQueryInfos} from '../_types/queryInfos';
import {dataloaderCtxKey, getOrCreateDataLoaderInCtx} from './dataloader';

describe('Dataloader', () => {
    describe('getOrCreateDataLoaderInCtx', () => {
        test('Should not be serialized in ctx', async () => {
            const ctx: IQueryInfos = {userId: 'user1'};
            getOrCreateDataLoaderInCtx(ctx, 'testLoader', () => new DataLoader(async keys => keys.map(() => 41)));
            const serialized = JSON.stringify(ctx);
            expect(serialized).not.toContain(dataloaderCtxKey);
        });

        test('Should create a new dataloader if not present', () => {
            const ctx: IQueryInfos = {userId: 'user2'};
            const loader = getOrCreateDataLoaderInCtx(
                ctx,
                'loaderA',
                () => new DataLoader(async keys => keys.map(() => 42)),
            );
            expect(loader).toBeInstanceOf(DataLoader);
        });

        test('Should return the same dataloader instance on subsequent calls', () => {
            const ctx: IQueryInfos = {userId: 'user3'};
            const loader1 = getOrCreateDataLoaderInCtx(
                ctx,
                'loaderB',
                () => new DataLoader(async keys => keys.map(() => 43)),
            );
            const loader2 = getOrCreateDataLoaderInCtx(
                ctx,
                'loaderB',
                () => new DataLoader(async keys => keys.map(() => 44)),
            );
            expect(loader1).toBe(loader2);
        });

        test('Should create different dataloaders for different keys', () => {
            const ctx: IQueryInfos = {userId: 'user4'};
            const loaderA = getOrCreateDataLoaderInCtx(
                ctx,
                'loaderA',
                () => new DataLoader(async keys => keys.map(() => 45)),
            );
            const loaderB = getOrCreateDataLoaderInCtx(
                ctx,
                'loaderB',
                () => new DataLoader(async keys => keys.map(() => 46)),
            );
            expect(loaderA).not.toBe(loaderB);
        });
    });
});
