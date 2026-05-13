import {type IDbService} from '../dbService';
import {aql} from 'arangojs';
import {VIEWS_COLLECTION_NAME} from '../../view/_types';
import {type IMigration} from '../../../_types/migration';
import {type IQueryInfos} from '../../../_types/queryInfos';

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
            ctx,
        });
    };

    return {
        async run(ctx) {
            await _migrateViewSortToArray(ctx);
        },
    };
}
