import {Database} from 'arangojs';

export interface IDbService {
    db: Database;
    execute(query: string): Promise<any>;
}

export default function(config: any): IDbService {
    const db = new Database({
        url: config.db.url
    });
    db.useDatabase(config.db.name);

    async function execute(query: string): Promise<any> {
        return db.query(query);
    }

    return {
        db,
        execute
    };
}
