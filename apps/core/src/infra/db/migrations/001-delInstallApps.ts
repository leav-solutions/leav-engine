import {type IMigration} from '../../../_types/migration';
import {type IDbService} from '../dbService';
import {aql} from 'arangojs';
import {type IQueryInfos} from '../../../_types/queryInfos';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    const _deleteInstallApps = async (ctx: IQueryInfos) => {
        const appsCollec = dbService.db.collection('core_applications');

        const query = aql`
            FOR doc IN ${appsCollec}
                UPDATE doc WITH { 
                    install: null, 
                    module: doc.module == 'admin-app' ? 'admin' : doc.module 
                } IN ${appsCollec}
                OPTIONS { keepNull: false }
            RETURN NEW
        `;

        await dbService.execute({query, ctx});
    };

    return {
        async run(ctx) {
            await _deleteInstallApps(ctx);
        },
    };
}
