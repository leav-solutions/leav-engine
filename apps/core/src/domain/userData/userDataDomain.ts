// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {IUserData} from '_types/userData';
import {IUserDataRepo} from 'infra/userData/userDataRepo';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {PermissionTypes, AppPermissionsActions} from '../../_types/permissions';
import PermissionError from '../../errors/PermissionError';

export interface IUserDataDomain {
    saveUserData(key: string, value: any, global: boolean, ctx: IQueryInfos): Promise<any>;
    getUserData(key: string, global: boolean, ctx: IQueryInfos): Promise<IUserData>;
}

interface IDeps {
    'core.domain.permissions'?: IPermissionDomain;
    'core.infra.userData'?: IUserDataRepo;
    'core.domain.permission'?: IPermissionDomain;
}

export default function ({
    'core.infra.userData': userDataRepo = null,
    'core.domain.permission': permissionDomain = null
}: IDeps = {}): IUserDataDomain {
    return {
        async saveUserData(key: string, value: any, global: boolean, ctx: IQueryInfos): Promise<any> {
            if (
                global &&
                !(await permissionDomain.isAllowed({
                    type: PermissionTypes.APP,
                    action: AppPermissionsActions.MANAGE_GLOBAL_PREFERENCES,
                    userId: ctx.userId,
                    ctx
                }))
            ) {
                throw new PermissionError(AppPermissionsActions.MANAGE_GLOBAL_PREFERENCES);
            }

            return userDataRepo.saveUserData(key, value, global, ctx);
        },
        async getUserData(key: string, global: boolean = false, ctx: IQueryInfos): Promise<IUserData> {
            const isAllowed = await permissionDomain.isAllowed({
                type: PermissionTypes.APP,
                action: AppPermissionsActions.MANAGE_GLOBAL_PREFERENCES,
                userId: ctx.userId,
                ctx
            });

            if (global && !isAllowed) {
                throw new PermissionError(AppPermissionsActions.MANAGE_GLOBAL_PREFERENCES);
            }

            const res = await userDataRepo.getUserData(key, global, ctx);

            // if private data is null get global data
            if (isAllowed && res.data === null && !global) {
                return userDataRepo.getUserData(key, true, ctx);
            }

            return res;
        }
    };
}
