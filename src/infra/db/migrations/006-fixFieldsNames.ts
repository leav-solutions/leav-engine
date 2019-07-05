import {aql} from 'arangojs';
import {IDbService} from '../dbService';
import {IMigration} from '../dbUtils';

export default function(dbService: IDbService): IMigration {
    return {
        async run() {
            const res = await dbService.execute(aql`
                FOR a in core_attributes
                    UPDATE a WITH {
                        versions_conf: a.versions_conf ? a.versions_conf : a.versionsConf,
                        permissions_conf: a.permissions_conf ? a.permissions_conf : a.permissionsConf,
                        multiple_values: a.multiple_values ? a.multiple_values : TO_BOOL(a.multipleValues),
                        versionsConf: null,
                        permissionsConf: null,
                        multipleValues: null
                    } IN core_attributes OPTIONS { keepNull: false }
            `);
        }
    };
}
