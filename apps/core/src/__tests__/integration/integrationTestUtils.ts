// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AwilixContainer} from 'awilix';

export interface IGlobalThis {
    coreContainer: AwilixContainer;
    taskManagerMasterTimer: NodeJS.Timeout;
}

declare const globalThis: IGlobalThis;

export const getCoreContainer = (): AwilixContainer => globalThis.coreContainer;

export const getCoreDep = <T>(path): T => getCoreContainer().cradle[path];
