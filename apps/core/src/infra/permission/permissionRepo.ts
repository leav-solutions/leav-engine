// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IQueryInfos} from '_types/queryInfos';
import {IPermission, IPermissionsTreeTarget, PermissionTypes} from '../../_types/permissions';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';

export interface IPermissionRepo {
    savePermission({permData, ctx}: {permData: IPermission; ctx: IQueryInfos}): Promise<IPermission>;
    getPermissions({
        type,
        applyTo,
        usersGroupId,
        permissionTreeTarget,
        ctx
    }: {
        type: PermissionTypes;
        applyTo: string;
        usersGroupId: string | null;
        permissionTreeTarget?: IPermissionsTreeTarget;
        ctx: IQueryInfos;
    }): Promise<IPermission | null>;
}

interface IDbPermissionsTreeTarget {
    id: string;
    tree: string;
}

const PERM_COLLECTION_NAME = 'core_permissions';
const USERS_GROUP_LIB_NAME = 'users_groups';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
}
export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null
}: IDeps = {}): IPermissionRepo {
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
        async savePermission({permData, ctx}): Promise<IPermission> {
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

            const res = await dbService.execute({
                query: aql`
                    UPSERT ${searchObj}
                    INSERT ${dbPermData}
                    UPDATE ${dbPermData}
                    IN ${col}
                    RETURN NEW
                `,
                ctx
            });

            const savedPerm = {
                ...res[0],
                usersGroup: permData.usersGroup ? res[0].usersGroup : null,
                permissionTreeTarget: _toCoreTreeTarget(res[0].permissionTreeTarget)
            };

            return dbUtils.cleanup(savedPerm);
        },
        async getPermissions({
            type,
            applyTo = null,
            usersGroupId,
            permissionTreeTarget = null,
            ctx
        }): Promise<IPermission | null> {
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

            const res = await dbService.execute({query, ctx});

            return res.length
                ? {
                      ...res[0],
                      permissionTreeTarget: _toCoreTreeTarget(res[0].permissionTreeTarget)
                  }
                : null;
        }
    };
}
