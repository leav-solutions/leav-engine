import {aql} from 'arangojs';
import {IPermission, PermissionTypes, IPermissionsTreeTarget} from '../../_types/permissions';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';

export interface IPermissionRepo {
    savePermission(permData: IPermission): Promise<IPermission>;
    getPermissions(
        type: PermissionTypes,
        applyTo: string,
        usersGroupId: number,
        permissionTreeTarget?: IPermissionsTreeTarget
    ): Promise<IPermission | null>;
}

interface IDbPermissionsTreeTarget {
    id: string;
    tree: string;
}

const PERM_COLLECTION_NAME = 'core_permissions';
const USERS_GROUP_LIB_NAME = 'users_groups';

export default function(dbService: IDbService, dbUtils: IDbUtils = null): IPermissionRepo {
    function _toDbTreeTarget(treeTarget: IPermissionsTreeTarget): IDbPermissionsTreeTarget {
        return {
            id: treeTarget.library + '/' + treeTarget.id,
            tree: treeTarget.tree
        };
    }

    function _toCoreTreeTarget(treeTarget: IDbPermissionsTreeTarget): IPermissionsTreeTarget {
        const [library, id] = treeTarget.id.split('/');

        return {
            ...treeTarget,
            id,
            library
        };
    }

    return {
        async savePermission(permData: IPermission): Promise<IPermission> {
            // Upsert in permissions collection
            const col = dbService.db.collection(PERM_COLLECTION_NAME);
            const dbPermData = {
                ...permData,
                usersGroup: USERS_GROUP_LIB_NAME + '/' + permData.usersGroup,
                permissionTreeTarget: _toDbTreeTarget(permData.permissionTreeTarget)
            };

            const searchObj = {
                type: dbPermData.type,
                applyTo: dbPermData.applyTo,
                usersGroup: dbPermData.usersGroup,
                permissionTreeTarget: dbPermData.permissionTreeTarget
            };

            const res = await dbService.execute(aql`
                UPSERT ${searchObj}
                INSERT ${dbPermData}
                UPDATE ${dbPermData}
                IN ${col}
                RETURN NEW
            `);

            return dbUtils.cleanup(res.pop());
        },
        async getPermissions(
            type: PermissionTypes,
            applyTo: string,
            usersGroupId: number,
            permissionTreeTarget: IPermissionsTreeTarget = null
        ): Promise<IPermission | null> {
            const col = dbService.db.collection(PERM_COLLECTION_NAME);

            const dbTarget = _toDbTreeTarget(permissionTreeTarget);

            const query = aql`
                FOR p IN ${col}
                FILTER p.type == ${type}
                    AND p.applyTo == ${applyTo}
                    AND p.usersGroup == ${USERS_GROUP_LIB_NAME + '/' + usersGroupId}
                    AND p.permissionTreeTarget == ${dbTarget}
                RETURN p
            `;

            const res = await dbService.execute(query);

            return res.length
                ? {
                      ...res[0],
                      permissionTreeTarget: _toCoreTreeTarget(res[0].permissionTreeTarget)
                  }
                : null;
        }
    };
}
