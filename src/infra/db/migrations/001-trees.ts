import {IMigration} from '../dbUtils';
import {IDbService} from '../dbService';

export default function(dbService: IDbService): IMigration {
    return {
        async run() {
            if (!(await dbService.collectionExists('core_trees'))) {
                await dbService.createCollection('core_trees');
            }
        }
    };
}
