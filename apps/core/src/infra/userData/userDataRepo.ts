// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IQueryInfos} from '_types/queryInfos';
import {IUserData} from '_types/userData';
import {IDbService} from '../db/dbService';

const USER_DATA_COLLECTION = 'core_user_data';

export interface IUserDataRepo {
    saveUserData(key: string, value: any, global: boolean, ctx: IQueryInfos, isCoreData?: boolean): Promise<IUserData>;
    getUserData(keys: string[], global: boolean, ctx: IQueryInfos): Promise<IUserData>;
}

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps = {}): IUserDataRepo {
    return {
        async saveUserData(
            key: string,
            value: any,
            global: boolean,
            ctx: IQueryInfos,
            isCoreData: boolean = false
        ): Promise<IUserData> {
            const collection = dbService.db.collection(USER_DATA_COLLECTION);
            const dataKey = isCoreData ? 'core_data' : 'data';

            const res = await dbService.execute({
                query: aql`
                    UPSERT ${{userId: global ? null : ctx.userId}}
                    INSERT ${{userId: global ? null : ctx.userId, data: {[key]: value}}}
                    UPDATE ${{[dataKey]: {[key]: typeof value !== 'undefined' ? value : null}}}
                    IN ${collection}
                    OPTIONS { mergeObjects: true, keepNull: false }
                    RETURN NEW`,
                ctx
            });

            return {global, data: {[key]: res[0].data[key]}};
        },
        async getUserData(keys: string[], global: boolean, ctx: IQueryInfos): Promise<IUserData> {
            const collection = dbService.db.collection(USER_DATA_COLLECTION);

            const userData = await dbService.execute({
                query: aql`
                    LET userData = 
                        FIRST(FOR e IN ${collection}
                            FILTER e.userId == ${global ? null : ctx.userId}
                        RETURN e)

                    LET MERGED = MERGE(userData.data, userData.core_data)

                    RETURN KEEP(MERGED, ${keys})
                `,
                ctx
            });

            return {global, data: userData[0] || {}};
        }
    };
}
