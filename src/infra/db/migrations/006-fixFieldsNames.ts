import {aql} from 'arangojs';
import {IMigration} from '_types/migration';
import {IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            const res = await dbService.execute({
                query: aql`
                    FOR a in core_attributes
                        UPDATE a WITH {
                            versions_conf: a.versions_conf ? a.versions_conf : a.versionsConf,
                            permissions_conf: a.permissions_conf ? a.permissions_conf : a.permissionsConf,
                            multiple_values: a.multiple_values ? a.multiple_values : TO_BOOL(a.multipleValues),
                            versionsConf: null,
                            permissionsConf: null,
                            multipleValues: null
                        } IN core_attributes OPTIONS { keepNull: false }
                `,
                ctx
            });
        }
    };
}
