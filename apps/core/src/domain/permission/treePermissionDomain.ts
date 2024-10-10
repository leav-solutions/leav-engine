// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionTypes} from '../../_types/permissions';
import {IGlobalPermissionHelper} from './helpers/globalPermission';
import {IGetInheritedTreePermissionParams, IGetTreePermissionParams} from './_types';

export interface ITreePermissionDomain {
    getTreePermission(params: IGetTreePermissionParams): Promise<boolean>;
    getInheritedTreePermission(params: IGetInheritedTreePermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.globalPermission': IGlobalPermissionHelper;
}
export default function ({
    'core.domain.permission.helpers.globalPermission': globalPermHelper
}: IDeps): ITreePermissionDomain {
    const getTreePermission = async ({action, treeId, userId, ctx}: IGetTreePermissionParams): Promise<boolean> =>
        globalPermHelper.getGlobalPermission(
            {
                type: PermissionTypes.TREE,
                action,
                applyTo: treeId,
                userId
            },
            ctx
        );

    const getInheritedTreePermission = async ({
        action,
        treeId,
        userGroupId,
        ctx
    }: IGetInheritedTreePermissionParams): Promise<boolean> =>
        globalPermHelper.getInheritedGlobalPermission(
            {
                type: PermissionTypes.TREE,
                action,
                applyTo: treeId,
                userGroupNodeId: userGroupId
            },
            ctx
        );

    return {
        getTreePermission,
        getInheritedTreePermission
    };
}
