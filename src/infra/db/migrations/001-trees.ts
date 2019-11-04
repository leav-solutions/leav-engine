import {IDbService} from '../dbService';
import {IMigration} from '../dbUtils';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    return {
        async run() {
            if (!(await dbService.collectionExists('core_trees'))) {
                await dbService.createCollection('core_trees');
            }
        }
    };
}
