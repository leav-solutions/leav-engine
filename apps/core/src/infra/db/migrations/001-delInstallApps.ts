// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IMigration} from '_types/migration';
import {IDbService} from '../dbService';
import {aql} from 'arangojs';
import {IQueryInfos} from '_types/queryInfos';

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
        }
    };
}
