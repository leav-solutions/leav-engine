// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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
    'core.domain.indexationManager': IIndexationManagerDomain;
}

export default function ({'core.domain.indexationManager': indexationManager}: IDeps): IIndexationManagerApp {
    return {
        init: () => indexationManager.init(),
        indexDatabase: async (ctx: IQueryInfos, libraryId: string, records?: string[]) => {
            // if records are undefined we re-index all library's records
            const filters = (records ?? []).reduce((acc, id, _, array) => {
                acc.push({field: 'id', condition: AttributeCondition.EQUAL, value: id});
                const isNotLastElement = array.length > 1;
                if (isNotLastElement) {
                    acc.push({operator: Operator.OR});
                }
                return acc;
            }, []);

            await indexationManager.indexDatabase({
                findRecordParams: {library: libraryId, ...(filters.length && {filters})},
                ctx
            });
        }
    };
}
