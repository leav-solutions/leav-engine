// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionTypes} from '../../_types/permissions';
import {IGlobalPermissionHelper} from './helpers/globalPermission';
import {IGetApplicationPermissionParams, IGetInheritedApplicationPermissionParams} from './_types';

export interface IApplicationPermissionDomain {
    getApplicationPermission(params: IGetApplicationPermissionParams): Promise<boolean>;
    getInheritedApplicationPermission(params: IGetInheritedApplicationPermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.globalPermission': IGlobalPermissionHelper;
}

export default function ({
    'core.domain.permission.helpers.globalPermission': globalPermHelper
}: IDeps): IApplicationPermissionDomain {
    const getApplicationPermission = async ({
        action,
        applicationId,
        userId,
        ctx
    }: IGetApplicationPermissionParams): Promise<boolean> =>
        globalPermHelper.getGlobalPermission(
            {
                type: PermissionTypes.APPLICATION,
                action,
                applyTo: applicationId,
                userId
            },
            ctx
        );

    const getInheritedApplicationPermission = async ({
        action,
        applicationId,
        userGroupId,
        ctx
    }: IGetInheritedApplicationPermissionParams): Promise<boolean> =>
        globalPermHelper.getInheritedGlobalPermission(
            {
                type: PermissionTypes.APPLICATION,
                action,
                applyTo: applicationId,
                userGroupNodeId: userGroupId
            },
            ctx
        );

    return {
        getApplicationPermission,
        getInheritedApplicationPermission
    };
}
