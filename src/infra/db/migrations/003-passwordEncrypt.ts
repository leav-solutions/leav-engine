import {aql} from 'arangojs';
import {IMigration} from '_types/migration';
import {IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            const docToUpdate = {
                _key: 'password',
                actions_list: {
                    saveValue: [
                        {
                            name: 'validateFormat',
                            is_system: true
                        },
                        {
                            name: 'encrypt',
                            is_system: true
                        }
                    ]
                }
            };
            const res = await dbService.execute({
                query: aql`UPDATE ${docToUpdate} IN core_attributes `,
                ctx
            });
        }
    };
}
