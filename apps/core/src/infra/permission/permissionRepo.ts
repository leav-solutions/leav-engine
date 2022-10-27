// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IDbDocument} from 'infra/db/_types';
import {IQueryInfos} from '_types/queryInfos';
import {IPermission, IPermissionsTreeTarget, PermissionTypes} from '../../_types/permissions';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';

export interface IPermissionRepo {
    savePermission({permData, ctx}: {permData: IPermission; ctx: IQueryInfos}): Promise<IPermission>;
    getPermissions({
        type,
        applyTo,
        usersGroupNodeId,
        permissionTreeTarget,
        ctx
    }: {
        type: PermissionTypes;
        applyTo: string;
        usersGroupNodeId: string | null;
        permissionTreeTarget?: IPermissionsTreeTarget;
        ctx: IQueryInfos;
    }): Promise<IPermission | null>;
}

type DbPermission = IDbDocument & IPermission;

export const PERM_COLLECTION_NAME = 'core_permissions';
export const USERS_GROUP_LIB_NAME = 'users_groups';
export const USERS_GROUP_TREE_NAME = 'users_groups';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
}
export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null
}: IDeps = {}): IPermissionRepo {
    return {
        async savePermission({permData, ctx}): Promise<IPermission> {
            const userGroupToSave = permData.usersGroup ?? null;

            // Upsert in permissions collection
            const col = dbService.db.collection(PERM_COLLECTION_NAME);
            const dbPermData = {
                ...permData,
                usersGroup: userGroupToSave
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
                usersGroup: permData.usersGroup ? res[0].usersGroup : null
            };

            return dbUtils.cleanup(savedPerm);
        },
        async getPermissions({
            type,
            applyTo = null,
            usersGroupNodeId,
            permissionTreeTarget = null,
            ctx
        }): Promise<IPermission | null> {
            const col = dbService.db.collection(PERM_COLLECTION_NAME);

            const userGroupToFilter = usersGroupNodeId ?? null;

            const query = aql`
                FOR p IN ${col}
                FILTER p.type == ${type}
                    AND p.applyTo == ${applyTo}
                    AND p.usersGroup == ${userGroupToFilter}
                    AND p.permissionTreeTarget == ${permissionTreeTarget}
                RETURN p
            `;

            const res = await dbService.execute<DbPermission[]>({query, ctx});

            return res[0] ?? null;
        }
    };
}
