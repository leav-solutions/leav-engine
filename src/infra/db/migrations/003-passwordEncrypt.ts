import {aql} from 'arangojs';
import {IDbService} from '../dbService';
import {IMigration} from '../dbUtils';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    return {
        async run() {
            const docToUpdate = {
                _key: 'password',
                actions_list: {
                    saveValue: [
                        {
                            name: 'encrypt',
                            is_system: true
                        }
                    ]
                }
            };
            const res = await dbService.execute(aql`UPDATE ${docToUpdate} IN core_attributes `);
        }
    };
}
