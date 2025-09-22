// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import type DataLoader from 'dataloader';
import {type IQueryInfos} from '_types/queryInfos';

export const dataloaderCtxKey: keyof IQueryInfos = 'dataLoaders' as const;
/**
 * Get or create a DataLoader in the request context.
 * Each usage (not each call) of this function should use a unique name to avoid conflicts among different DataLoaders.
 * Name is used has key to store the DataLoader in ctx.dataLoaders.
 */
export function getOrCreateDataLoaderInCtx<DL extends DataLoader<unknown, unknown>>(
    ctx: IQueryInfos,
    name: string,
    create: () => DL
): DL {
    // Important to not serialize dataLoaders to JSON for task submission for instance;
    // ctx is in task params, saved in core_tasks collection and read by worker
    if (ctx.dataLoaders == null) {
        Object.defineProperty(ctx, dataloaderCtxKey, {
            value: {},
            enumerable: false,
            writable: true,
            configurable: true
        });
    }
    if (!ctx.dataLoaders[name]) {
        ctx.dataLoaders[name] = create();
    }
    return ctx.dataLoaders[name] as DL;
}
