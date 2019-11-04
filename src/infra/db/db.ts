import {Database} from 'arangojs';

interface IDeps {
    config?: any;
}

export default function({config}: IDeps = {}): Database {
    const db = new Database({
        url: config.db.url
    });
    db.useDatabase(config.db.name);

    return db;
}
