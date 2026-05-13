import {PermissionTypes} from '../../_types/permissions';
import {type IGlobalPermissionHelper} from './helpers/globalPermission';
import {type IGetInheritedTreePermissionParams, type IGetTreePermissionParams} from './_types';

export interface ITreePermissionDomain {
    getTreePermission(params: IGetTreePermissionParams): Promise<boolean>;
    getInheritedTreePermission(params: IGetInheritedTreePermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.globalPermission': IGlobalPermissionHelper;
}
export default function ({
    'core.domain.permission.helpers.globalPermission': globalPermHelper,
}: IDeps): ITreePermissionDomain {
    const getTreePermission = async ({action, treeId, ctx}: IGetTreePermissionParams): Promise<boolean> =>
        globalPermHelper.getGlobalPermission(
            {
                type: PermissionTypes.TREE,
                action,
                applyTo: treeId,
            },
            ctx,
        );

    const getInheritedTreePermission = async ({
        action,
        treeId,
        userGroupId,
        ctx,
    }: IGetInheritedTreePermissionParams): Promise<boolean> =>
        globalPermHelper.getInheritedGlobalPermission(
            {
                type: PermissionTypes.TREE,
                action,
                applyTo: treeId,
                userGroupNodeId: userGroupId,
            },
            ctx,
        );

    return {
        getTreePermission,
        getInheritedTreePermission,
    };
}
