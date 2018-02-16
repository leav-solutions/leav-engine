import {Database} from 'arangojs';

export default function(config: any): Database {
    const db = new Database({
        url: config.db.url
    });
    db.useDatabase(config.db.name);

    return db;
}
