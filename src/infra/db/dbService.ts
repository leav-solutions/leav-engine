import {Database} from 'arangojs';

export default ({config}: any) => {
    const db = new Database({
        url: config.db.url
    });
    db.useDatabase(config.db.name);

    return db;
};
