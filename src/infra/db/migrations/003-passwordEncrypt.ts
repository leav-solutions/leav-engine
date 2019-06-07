import {aql} from 'arangojs';
import {IDbService} from '../dbService';

import {IMigration} from '../dbUtils';

export default function(dbService: IDbService): IMigration {
    return {
        async run() {
            const docToUpdate = {
                _key: 'password',
                actions_list: {
                    saveValue: [
                        {
                            name: 'encrypt'
                        }
                    ]
                }
            };
            const res = await dbService.execute(aql`UPDATE ${docToUpdate} IN core_attributes `);
        }
    };
}
