import {Database} from 'arangojs';

interface IDeps {
    config?: any;
}

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

export const initDb = async (config: any) => {
    const db = _getDbConnection(config);

    const databases = await db.listDatabases();
    const dbExists = databases.reduce((exists, d) => exists || d === config.db.name, false);

    if (!dbExists) {
        await db.createDatabase(config.db.name);
    }

    db.close();
};
