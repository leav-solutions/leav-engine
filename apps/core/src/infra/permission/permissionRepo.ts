// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, literal} from 'arangojs/aql';
import {type IDbDocument} from 'infra/db/_types';
import {type IQueryInfos} from '_types/queryInfos';
import {
    type IPermissionsDependenciesTreeTarget,
    type IPermission,
    type IPermissionsTreeTarget,
    type PermissionsActions,
    type PermissionTypes,
} from '../../_types/permissions';
import {type IDbService} from '../db/dbService';
import {type IDbUtils} from '../db/dbUtils';

export interface IPermissionRepo {
    savePermission({permData, ctx}: {permData: IPermission; ctx: IQueryInfos}): Promise<IPermission>;
    getPermissions({
        type,
        applyTo,
        usersGroupNodeId,
        permissionTreeTarget,
        dependenciesTreeTargets,
        ctx,
    }: {
        type: PermissionTypes;
        applyTo: string;
        usersGroupNodeId: string | null;
        permissionTreeTarget?: IPermissionsTreeTarget;
        dependenciesTreeTargets?: IPermissionsDependenciesTreeTarget[];
        ctx: IQueryInfos;
    }): Promise<IPermission | null>;
    getAllPermissionsForTree({
        type,
        applyTo,
        actionKey,
        treeId,
        groupsIds,
        ctx,
    }: {
        type: PermissionTypes;
        applyTo: string;
        actionKey: PermissionsActions;
        treeId: string;
        groupsIds: string[];
        ctx: IQueryInfos;
    }): Promise<IPermission[]>;
}

type DbPermission = IDbDocument & IPermission;

export const PERM_COLLECTION_NAME = 'core_permissions';
export const USERS_GROUP_ATTRIBUTE_NAME = 'user_groups';
export const USERS_GROUP_LIB_NAME = 'users_groups';
export const USERS_GROUP_TREE_NAME = 'users_groups';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
}
export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
}: IDeps = {}): IPermissionRepo {
    // Sort dependency tree targets to ensure consistent order for comparison in queries, dependent values should not be different by order
    const sortDependenciesTreeTargets = (
        depsTargets?: IPermissionsDependenciesTreeTarget[],
    ): IPermissionsDependenciesTreeTarget[] | undefined =>
        depsTargets?.slice().sort((a, b) => {
            if (a.attributeId < b.attributeId) {
                return -1;
            }
            if (a.attributeId > b.attributeId) {
                return 1;
            }
            return 0;
        }) || undefined;

    return {
        async savePermission({permData, ctx}): Promise<IPermission> {
            const userGroupToSave = permData.usersGroup ?? null;
            const sortedDependenciesTreeTargets = sortDependenciesTreeTargets(permData.dependenciesTreeTargets);

            // Upsert in permissions collection
            const col = dbService.db.collection(PERM_COLLECTION_NAME);
            const dbPermData = {
                ...permData,
                usersGroup: userGroupToSave,
                dependenciesTreeTargets: sortedDependenciesTreeTargets,
            };

            const searchObj = {
                type: dbPermData.type,
                applyTo: dbPermData.applyTo,
                usersGroup: dbPermData.usersGroup,
                permissionTreeTarget: dbPermData.permissionTreeTarget,
                dependenciesTreeTargets: sortedDependenciesTreeTargets,
            };

            const res = await dbService.execute({
                query: aql`
                    UPSERT ${searchObj}
                    INSERT ${dbPermData}
                    UPDATE ${dbPermData}
                    IN ${col}
                    RETURN NEW
                `,
                ctx,
            });

            const savedPerm = {
                ...res[0],
                usersGroup: permData.usersGroup ? res[0].usersGroup : null,
            };

            return dbUtils.cleanup(savedPerm);
        },
        async getPermissions({
            type,
            applyTo = null,
            usersGroupNodeId,
            permissionTreeTarget = null,
            dependenciesTreeTargets = null,
            ctx,
        }): Promise<IPermission | null> {
            const col = dbService.db.collection(PERM_COLLECTION_NAME);
            const sortedDependenciesTreeTargets = sortDependenciesTreeTargets(dependenciesTreeTargets);

            const userGroupToFilter = usersGroupNodeId ?? null;

            const query = aql`
                FOR p IN ${col}
                FILTER p.type == ${type}
                    AND p.applyTo == ${applyTo}
                    AND p.usersGroup == ${userGroupToFilter}
                    AND p.permissionTreeTarget == ${permissionTreeTarget}
                    ${
                        sortedDependenciesTreeTargets != null
                            ? aql`AND p.dependenciesTreeTargets == ${sortedDependenciesTreeTargets}`
                            : undefined
                    }
                RETURN p
            `;

            const res = await dbService.execute<DbPermission[]>({query, ctx});

            return res[0] ?? null;
        },
        async getAllPermissionsForTree({type, applyTo, actionKey, treeId, groupsIds, ctx}): Promise<IPermission[]> {
            const col = dbService.db.collection(PERM_COLLECTION_NAME);

            const query = aql`
                FOR p IN ${col}
                FILTER p.type == ${type}
                    AND p.applyTo == ${applyTo}
                    AND p.permissionTreeTarget.tree == ${treeId}
                    AND p.usersGroup IN ${groupsIds}
                    AND HAS(p.actions, ${actionKey})
                RETURN p
            `;
            const res = await dbService.execute<DbPermission[]>({query, ctx});
            return res;
        },
    };
}
