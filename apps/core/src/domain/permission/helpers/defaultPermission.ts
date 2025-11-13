// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {systemUserId} from '../../../_constants/users';
import {type IConfig} from '_types/config';
import {type IQueryInfos} from '_types/queryInfos';

interface IDeps {
    config: IConfig;
}

export interface IGetDefaultPermissionParams {
    ctx: IQueryInfos;
}
export type GetDefaultPermission = ({ctx}: IGetDefaultPermissionParams) => boolean;

export interface IDefaultPermissionHelper {
    getDefaultPermission: GetDefaultPermission;
}

export default function ({config}: IDeps): IDefaultPermissionHelper {
    return {
        getDefaultPermission({ctx}: IGetDefaultPermissionParams): boolean {
            // system user always has permission
            if (ctx.userId === systemUserId) {
                return true;
            }

            return config.permissions.default ?? true;
        },
    };
}
