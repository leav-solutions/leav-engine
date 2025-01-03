// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IDbService} from '../dbService';
import {aql} from 'arangojs';
import {VIEWS_COLLECTION_NAME} from '../../view/_types';
import {IMigration} from '_types/migration';
import {IQueryInfos} from '_types/queryInfos';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    const _migrateViewSortToArray = (ctx: IQueryInfos) => {
        const viewsCollection = dbService.db?.collection(VIEWS_COLLECTION_NAME);
        return dbService.execute({
            query: aql`
                FOR view IN ${viewsCollection}
                    LET viewSort = VALUE(view, ["sort"])
                    FILTER viewSort != null AND !IS_ARRAY(viewSort)
                    UPDATE view with {"sort": [viewSort]} IN ${viewsCollection}
                return NEW
            `,
            ctx
        });
    };

    return {
        async run(ctx) {
            await _migrateViewSortToArray(ctx);
        }
    };
}
