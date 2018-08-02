import {aql} from 'arangojs';
import {IPermission, PermissionTypes, IPermissionsTreeTarget} from '../_types/permissions';
import {IDbService} from './db/dbService';
import {IDbUtils} from './db/dbUtils';

export interface IPermissionRepo {
    savePermission(permData: IPermission): Promise<IPermission>;
    getPermissions(
        type: PermissionTypes,
        usersGroup: string,
        target?: IPermissionsTreeTarget
    ): Promise<IPermission | null>;
}

const PERM_COLLECTION_NAME = 'core_permissions';

export default function(dbService: IDbService, dbUtils: IDbUtils = null): IPermissionRepo {
    return {
        async savePermission(permData: IPermission): Promise<IPermission> {
            // Upsert in permissions collection
            const col = dbService.db.collection(PERM_COLLECTION_NAME);
            const searchObj = {
                type: permData.type,
                usersGroup: permData.usersGroup,
                target: permData.target
            };

            const res = await dbService.execute(aql`
                UPSERT ${searchObj}
                INSERT ${permData}
                UPDATE ${permData}
                IN ${col}
                RETURN NEW
            `);

            return dbUtils.cleanup(res.pop());
        },
        async getPermissions(
            type: PermissionTypes,
            usersGroup: string,
            target: IPermissionsTreeTarget = null
        ): Promise<IPermission | null> {
            const col = dbService.db.collection(PERM_COLLECTION_NAME);
            const query = aql`
                FOR p IN ${col}
                FILTER p.type == ${type}
                    AND p.usersGroup == ${usersGroup}
                    AND p.target == ${target}
                RETURN p
            `;

            const res = await dbService.execute(query);

            return res.length ? res[0] : null;
        }
    };
}
