import {aql} from 'arangojs';
import {type IDbService} from '../dbService';
import {type IMigration} from '../../../_types/migration';
import {APPLICATIONS_COLLECTION_NAME} from '../../application/applicationRepo';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService}: IDeps): IMigration {
    // data-studio has been removed from the codebase and replaced by app-studio (explorer-studio
    // instance). Drop the system application record seeded by 000-init on existing databases.
    const DATA_STUDIO_KEY = 'data_studio';

    return {
        async run(ctx) {
            const applicationsCol = dbService.db.collection(APPLICATIONS_COLLECTION_NAME);

            await dbService.execute({
                query: aql`
                    FOR app IN ${applicationsCol}
                        FILTER app._key == ${DATA_STUDIO_KEY}
                        REMOVE app IN ${applicationsCol}
                `,
                ctx,
            });
        },
    };
}
