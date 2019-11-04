import {aql} from 'arangojs';
import {IDbService} from '../dbService';
import {IMigration} from '../dbUtils';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    return {
        async run() {
            const res = await dbService.execute(aql`
                FOR el in core_attributes
                    FILTER el.versions_conf == null
                    UPDATE el WITH {versions_conf: {versionable: false, trees: []}} IN core_attributes
            `);
        }
    };
}
