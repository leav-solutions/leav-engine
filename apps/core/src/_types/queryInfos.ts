// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IDbProfiler} from './dbProfiler';
import {IValueVersion} from './value';

export interface IQueryInfos {
    userId?: string;
    lang?: string;
    queryId?: string;
    version?: IValueVersion;
    treeId?: string;
    groupsId?: string[];
    applicationId?: string;
    dbProfiler?: IDbProfiler;
}
