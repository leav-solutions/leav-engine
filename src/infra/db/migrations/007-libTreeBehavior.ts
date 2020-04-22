import {aql} from 'arangojs';
import {IMigration} from '_types/migration';
import {IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            await dbService.execute({
                query: aql`
                    FOR l in core_libraries
                        FILTER l.behavior == null
                        UPDATE l WITH {behavior: 'standard'} IN core_libraries
                `,
                ctx
            });

            await dbService.execute({
                query: aql`
                    FOR t in core_trees
                        FILTER t.behavior == null
                        UPDATE t WITH {behavior: 'standard'} IN core_trees
                `,
                ctx
            });
        }
    };
}
