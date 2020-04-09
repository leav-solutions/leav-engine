import {IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function({'core.infra.db.dbService': dbService = null}: IDeps = {}) {
    return {
        async run() {
            if (!(await dbService.collectionExists('core_forms'))) {
                await dbService.createCollection('core_forms');
            }
        }
    };
}
