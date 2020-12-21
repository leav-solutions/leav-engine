// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionTypes} from '../../_types/permissions';
import {IGlobalPermissionHelper} from './helpers/globalPermission';
import {IGetHeritedTreePermissionParams, IGetTreePermissionParams} from './_types';

export interface ITreePermissionDomain {
    getTreePermission(params: IGetTreePermissionParams): Promise<boolean>;
    getHeritedTreePermission(params: IGetHeritedTreePermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.globalPermission'?: IGlobalPermissionHelper;
}
export default function ({
    'core.domain.permission.helpers.globalPermission': globalPermHelper = null
}: IDeps = {}): ITreePermissionDomain {
    const getTreePermission = async ({action, treeId, userId, ctx}: IGetTreePermissionParams): Promise<boolean> => {
        return globalPermHelper.getGlobalPermission(
            {
                type: PermissionTypes.TREE,
                action,
                applyTo: treeId,
                userId
            },
            ctx
        );
    };

    const getHeritedTreePermission = async ({
        action,
        treeId,
        userGroupId,
        ctx
    }: IGetHeritedTreePermissionParams): Promise<boolean> => {
        return globalPermHelper.getInheritedGlobalPermission(
            {
                type: PermissionTypes.TREE,
                action,
                applyTo: treeId,
                userGroupId
            },
            ctx
        );
    };

    return {
        getTreePermission,
        getHeritedTreePermission
    };
}
