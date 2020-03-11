import {Database} from 'arangojs';

const _getDbConnection = (config: any): Database => {
    return new Database({
        url: config.db.url
    });
};

export default function(deps: IDeps = {}): Database {
    const db = _getDbConnection(deps.config);

    db.useDatabase(deps.config.db.name);

    return db;
}
