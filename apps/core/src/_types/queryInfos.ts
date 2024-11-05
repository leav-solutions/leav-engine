// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import type LeavError from 'errors/LeavError';
import {IDbProfiler} from './dbProfiler';
import {IValueVersion} from './value';

export interface IQueryInfos {
    userId: string;
    lang?: string;
    defaultLang?: string;
    queryId?: string;
    version?: IValueVersion;
    treeId?: string;
    groupsId?: string[];
    applicationId?: string;
    dbProfiler?: IDbProfiler;
    trigger?: string;
    errors?: Array<LeavError<unknown>>;
}
