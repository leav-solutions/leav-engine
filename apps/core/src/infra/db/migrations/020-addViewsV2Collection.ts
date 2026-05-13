import {type IMigration} from '../../../_types/migration';
import {CollectionType} from 'arangojs/collection';
import {type IDbService} from '../dbService';
import {VIEWS_V2_COLLECTION_NAME} from '../../viewV2/viewV2Repo';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            if (!(await dbService.collectionExists(VIEWS_V2_COLLECTION_NAME))) {
                await dbService.createCollection(VIEWS_V2_COLLECTION_NAME, CollectionType.DOCUMENT_COLLECTION);
            }
        },
    };
}
