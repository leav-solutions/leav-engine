import {type AwilixContainer} from 'awilix';

export interface IGlobalThis {
    coreContainer: AwilixContainer;
}

declare const globalThis: IGlobalThis;

export const getCoreContainer = (): AwilixContainer => globalThis.coreContainer;

export const getCoreDep = <T>(path): T => getCoreContainer().cradle[path];
