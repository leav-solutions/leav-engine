import {aql} from 'arangojs';
import {IDbService} from '../dbService';
import {IMigration} from '../dbUtils';

export default function(dbService: IDbService): IMigration {
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
