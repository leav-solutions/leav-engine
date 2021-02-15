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
            // Migrate field "libraries" on trees from an array to an object with settings
            await dbService.execute({
                query: aql`
                    FOR t in core_trees
                        UPDATE t WITH MERGE(t, {libraries: IS_ARRAY(t.libraries) ?
                            MERGE(
                                FOR lib IN TO_ARRAY(t.libraries)
                                    RETURN {
                                        [lib]: {allowMultiplePositions: false}
                                    }
                            )
                            : t.libraries
                        }) IN core_trees
                `,
                ctx
            });
        }
    };
}
