// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IIndexationManagerDomain} from 'domain/indexationManager/indexationManagerDomain';
import {IQueryInfos} from '_types/queryInfos';

export interface IIndexationManagerApp {
    init(): Promise<void>;
    indexDatabase(ctx: IQueryInfos, libraryId: string, records?: string[]): Promise<boolean>;
}

interface IDeps {
    'core.domain.indexationManager'?: IIndexationManagerDomain;
}

export default function ({'core.domain.indexationManager': indexationManager}: IDeps): IIndexationManagerApp {
    return {
        init: () => indexationManager.init(),
        indexDatabase: (ctx: IQueryInfos, libraryId: string, records?: string[]) =>
            indexationManager.indexDatabase(ctx, libraryId, records)
    };
}
