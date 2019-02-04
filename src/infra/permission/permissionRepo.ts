import {aql} from 'arangojs';
import {IPermission, IPermissionsTreeTarget, PermissionTypes} from '../../_types/permissions';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';

export interface IPermissionRepo {
    savePermission(permData: IPermission): Promise<IPermission>;
    getPermissions(
        type: PermissionTypes,
        applyTo: string,
        usersGroupId: number | null,
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
        if (treeTarget === null) {
            return null;
        }

        return {
            id: treeTarget.id && treeTarget.library ? treeTarget.library + '/' + treeTarget.id : null,
            tree: treeTarget.tree
        };
    }

    function _toCoreTreeTarget(treeTarget: IDbPermissionsTreeTarget): IPermissionsTreeTarget {
        if (treeTarget === null) {
            return null;
        }

        const [library, id] = treeTarget.id ? treeTarget.id.split('/') : [null, null];

        return {
            ...treeTarget,
            id,
            library
        };
    }

    return {
        async savePermission(permData: IPermission): Promise<IPermission> {
            const userGroupToSave = permData.usersGroup ? USERS_GROUP_LIB_NAME + '/' + permData.usersGroup : null;

            // Upsert in permissions collection
            const col = dbService.db.collection(PERM_COLLECTION_NAME);
            const dbPermData = {
                ...permData,
                usersGroup: userGroupToSave,
                permissionTreeTarget: permData.permissionTreeTarget
                    ? _toDbTreeTarget(permData.permissionTreeTarget)
                    : null
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

            const savedPerm = {
                ...res[0],
                usersGroup: permData.usersGroup ? res[0].usersGroup : null,
                permissionTreeTarget: _toCoreTreeTarget(res[0].permissionTreeTarget)
            };

            return dbUtils.cleanup(savedPerm);
        },
        async getPermissions(
            type: PermissionTypes,
            applyTo: string = null,
            usersGroupId: number | null,
            permissionTreeTarget: IPermissionsTreeTarget = null
        ): Promise<IPermission | null> {
            const col = dbService.db.collection(PERM_COLLECTION_NAME);

            const dbTarget = permissionTreeTarget ? _toDbTreeTarget(permissionTreeTarget) : null;

            const userGroupToFilter = usersGroupId ? USERS_GROUP_LIB_NAME + '/' + usersGroupId : null;

            const query = aql`
                FOR p IN ${col}
                FILTER p.type == ${type}
                    AND p.applyTo == ${applyTo}
                    AND p.usersGroup == ${userGroupToFilter}
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
