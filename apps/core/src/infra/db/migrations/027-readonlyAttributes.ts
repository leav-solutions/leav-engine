// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IMigration} from '_types/migration';
import {FilesAttributes} from '../../../_types/filesManager';
import {IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps): IMigration {
    return {
        async run(ctx) {
            const readonlyAttributes = [
                'id',
                'created_at',
                'created_by',
                'modified_at',
                'modified_by',
                ...Object.values(FilesAttributes).filter(a => a !== 'active')
            ];

            await dbService.execute({
                query: aql`
                FOR attribute IN core_attributes
                    let isReadonly = attribute._key IN ${readonlyAttributes}
                    UPDATE attribute WITH {readonly: isReadonly} IN core_attributes
            `,
                ctx
            });
        }
    };
}
