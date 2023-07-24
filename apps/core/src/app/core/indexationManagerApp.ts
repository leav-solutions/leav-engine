// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IIndexationManagerDomain} from 'domain/indexationManager/indexationManagerDomain';
import {IQueryInfos} from '_types/queryInfos';
import {AttributeCondition, Operator} from '../../_types/record';

export interface IIndexationManagerApp {
    init(): Promise<void>;
    indexDatabase(ctx: IQueryInfos, libraryId: string, records?: string[]): Promise<void>;
}

interface IDeps {
    'core.domain.indexationManager'?: IIndexationManagerDomain;
}

export default function ({'core.domain.indexationManager': indexationManager}: IDeps): IIndexationManagerApp {
    return {
        init: () => indexationManager.init(),
        indexDatabase: async (ctx: IQueryInfos, libraryId: string, records?: string[]) => {
            // if records are undefined we re-index all library's records
            const filters = (records || []).reduce((acc, id) => {
                acc.push({field: 'id', condition: AttributeCondition.EQUAL, value: id});
                if (records.length > 1) {
                    acc.push({operator: Operator.OR});
                }
                return acc;
            }, []);

            await indexationManager.indexDatabase({library: libraryId, ...(filters.length && {filters})}, ctx);
        }
    };
}
