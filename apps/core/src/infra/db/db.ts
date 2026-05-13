import {Database} from 'arangojs';
import {type IConfig} from '../../_types/config';

interface IDeps {
    config?: IConfig;
}

const _getDbConnection = (config: IConfig): Database =>
    new Database({
        url: config.db.url,
    });

export default function (deps: IDeps): Database {
    const db = _getDbConnection(deps.config);

    return db.database(deps.config.db.name);
}

export const initDb = async (config: IConfig) => {
    const db = _getDbConnection(config);

    const databases = await db.listDatabases();
    const dbExists = databases.reduce((exists, d) => exists || d === config.db.name, false);

    if (!dbExists) {
        await db.createDatabase(config.db.name);
    }

    db.close();
};
