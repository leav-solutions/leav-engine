import {type IMigration} from '../../../_types/migration';
import {CollectionType} from 'arangojs/collection';
import {type IDbService} from '../dbService';
import {RECORDS_SDO_COLLECTION_NAME} from '../../sdo/recordsSDORepo/recordSDORepo';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            if (!(await dbService.collectionExists(RECORDS_SDO_COLLECTION_NAME))) {
                await dbService.createCollection(RECORDS_SDO_COLLECTION_NAME, CollectionType.DOCUMENT_COLLECTION);
            }
        },
    };
}
