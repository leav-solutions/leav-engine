import {type IDepsManager} from '../../depsManager';

export interface IGlobalThis {
    coreContainer: IDepsManager;
}

declare const globalThis: IGlobalThis;

export const getCoreContainer = (): IDepsManager => globalThis.coreContainer;

export const getCoreDep = <T>(path): T => getCoreContainer().cradle[path];
