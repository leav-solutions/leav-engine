// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IMigration} from '_types/migration';
import {IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            await dbService.execute({
                query: aql`
                FOR t in core_trees
                UPDATE t WITH MERGE(t, {libraries: 
                    MERGE(
                        FOR lib IN ATTRIBUTES(t.libraries)
                            RETURN {[lib]: {
                                allowedAtRoot: true,
                                allowedChildren: ['__all__']
                            }}
                    )
                }) IN core_trees
                `,
                ctx
            });
        }
    };
}
