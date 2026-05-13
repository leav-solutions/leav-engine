import {type IMigration} from '../../../_types/migration';
import {CollectionType} from 'arangojs/collection';
import {type IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    const NOTIFICATIONS_COLLECTION_NAME = 'core_notifications';

    return {
        async run(ctx) {
            if (!(await dbService.collectionExists(NOTIFICATIONS_COLLECTION_NAME))) {
                await dbService.createCollection(NOTIFICATIONS_COLLECTION_NAME, CollectionType.DOCUMENT_COLLECTION);
            }
        },
    };
}
