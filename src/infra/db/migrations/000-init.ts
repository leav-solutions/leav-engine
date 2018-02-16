import {IMigration} from 'infra/db/dbUtils';
import {IDbService} from 'infra/db/dbService';

export default function(dbService: IDbService): IMigration {
    return {
        async run() {
            await dbService.createCollection('core_libraries');
        }
    };
}
