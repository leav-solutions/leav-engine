import {aql} from 'arangojs';
import {IDbService} from '../dbService';
import {IMigration} from '../dbUtils';

export default function(dbService: IDbService): IMigration {
    return {
        async run() {
            const res = await dbService.execute(aql`
                FOR a in core_attributes
                    UPDATE a WITH {
                        versions_conf: a.versionsConf, versionsConf: null,
                        permissions_conf: a.permissionsConf, permissionsConf: null,
                        multiple_values: a.multipleValues, multipleValues: null
                    } IN core_attributes OPTIONS { keepNull: false }
            `);
        }
    };
}
