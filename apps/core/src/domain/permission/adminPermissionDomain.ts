// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionTypes} from '../../_types/permissions';
import {IGlobalPermissionHelper} from './helpers/globalPermission';
import {IGetAdminPermissionParams, IGetInheritedAdminPermissionParams} from './_types';

export interface IAdminPermissionDomain {
    getAdminPermission({action, userId, ctx}: IGetAdminPermissionParams): Promise<boolean>;
    getInheritedAdminPermission({action, userGroupId, ctx}: IGetInheritedAdminPermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.globalPermission': IGlobalPermissionHelper;
}

export default function ({
    'core.domain.permission.helpers.globalPermission': globalPermHelper
}: IDeps): IAdminPermissionDomain {
    const getAdminPermission = async ({action, userId, ctx}: IGetAdminPermissionParams): Promise<boolean> =>
        globalPermHelper.getGlobalPermission(
            {
                type: PermissionTypes.ADMIN,
                action,
                userId
            },
            ctx
        );

    const getInheritedAdminPermission = async ({
        action,
        userGroupId,
        ctx
    }: IGetInheritedAdminPermissionParams): Promise<boolean> =>
        globalPermHelper.getInheritedGlobalPermission(
            {
                type: PermissionTypes.ADMIN,
                action,
                userGroupNodeId: userGroupId
            },
            ctx
        );

    return {
        getAdminPermission,
        getInheritedAdminPermission
    };
}
