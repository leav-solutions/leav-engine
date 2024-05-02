// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionTypes} from '../../_types/permissions';
import {IGlobalPermissionHelper} from './helpers/globalPermission';
import {IGetAttributePermissionParams, IGetInheritedAttributePermissionParams} from './_types';

export interface IAttributePermissionDomain {
    getAttributePermission(params: IGetAttributePermissionParams): Promise<boolean>;
    getInheritedAttributePermission(params: IGetInheritedAttributePermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.globalPermission'?: IGlobalPermissionHelper;
}

export default function (deps: IDeps = {}): IAttributePermissionDomain {
    const {'core.domain.permission.helpers.globalPermission': globalPermHelper = null} = deps;

    const getAttributePermission = async ({
        action,
        attributeId,
        ctx
    }: IGetAttributePermissionParams): Promise<boolean> =>
        globalPermHelper.getGlobalPermission(
            {
                type: PermissionTypes.ATTRIBUTE,
                action,
                applyTo: attributeId,
                userId: ctx.userId
            },
            ctx
        );

    const getInheritedAttributePermission = async ({
        action,
        attributeId,
        userGroupId,
        ctx
    }: IGetInheritedAttributePermissionParams): Promise<boolean> =>
        globalPermHelper.getInheritedGlobalPermission(
            {
                type: PermissionTypes.ATTRIBUTE,
                action,
                applyTo: attributeId,
                userGroupNodeId: userGroupId
            },
            ctx
        );

    return {
        getAttributePermission,
        getInheritedAttributePermission
    };
}
