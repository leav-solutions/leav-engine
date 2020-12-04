// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionTypes} from '../../_types/permissions';
import {IGlobalPermissionHelper} from './helpers/globalPermission';
import {IGetAttributePermissionParams, IGetHeritedAttributePermissionParams} from './_types';

export interface IAttributePermissionDomain {
    getAttributePermission(params: IGetAttributePermissionParams): Promise<boolean>;
    getHeritedAttributePermission(params: IGetHeritedAttributePermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.globalPermission'?: IGlobalPermissionHelper;
}

export default function(deps: IDeps = {}): IAttributePermissionDomain {
    const {'core.domain.permission.helpers.globalPermission': globalPermHelper = null} = deps;

    const getAttributePermission = async ({
        action,
        attributeId,
        ctx
    }: IGetAttributePermissionParams): Promise<boolean> => {
        return globalPermHelper.getGlobalPermission(
            {
                type: PermissionTypes.ATTRIBUTE,
                action,
                applyTo: attributeId,
                userId: ctx.userId
            },
            ctx
        );
    };

    const getHeritedAttributePermission = async ({
        action,
        attributeId,
        userGroupId,
        ctx
    }: IGetHeritedAttributePermissionParams): Promise<boolean> => {
        return globalPermHelper.getInheritedGlobalPermission(
            {
                type: PermissionTypes.ATTRIBUTE,
                action,
                applyTo: attributeId,
                userGroupId
            },
            ctx
        );
    };

    return {
        getAttributePermission,
        getHeritedAttributePermission
    };
}
