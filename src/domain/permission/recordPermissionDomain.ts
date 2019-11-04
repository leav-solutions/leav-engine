import {IValueRepo} from 'infra/value/valueRepo';
import {
    LibraryPermissionsActions,
    PermissionsActions,
    PermissionTypes,
    RecordPermissionsActions
} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {ILibraryDomain} from '../library/libraryDomain';
import {IPermissionDomain} from './permissionDomain';
import {IGetDefaultPermissionParams, ITreePermissionDomain} from './treePermissionDomain';

export interface IRecordPermissionDomain {
    getRecordPermission(action: string, userId: number, recordLibrary: string, recordId: number): Promise<boolean>;
    getHeritedRecordPermission(
        action: PermissionsActions,
        userGroupId: number,
        recordLibrary: string,
        permTree: string,
        permTreeNode: {id: string | number; library: string}
    ): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission'?: IPermissionDomain;
    'core.domain.permission.treePermission'?: ITreePermissionDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.value'?: IValueRepo;
}

export default function({
    'core.domain.permission': permissionDomain = null,
    'core.domain.permission.treePermission': treePermissionDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.infra.value': valueRepo = null
}: IDeps = {}): IRecordPermissionDomain {
    return {
        async getRecordPermission(
            action: RecordPermissionsActions,
            userId: number,
            recordLibrary: string,
            recordId: number
        ): Promise<boolean> {
            const lib = await libraryDomain.getLibraryProperties(recordLibrary);
            if (typeof lib.permissions_conf === 'undefined') {
                // Check if action is present in library permissions
                const isLibAction = Object.values(LibraryPermissionsActions).indexOf(action) !== -1;

                return isLibAction
                    ? permissionDomain.getLibraryPermission(
                          (action as unknown) as LibraryPermissionsActions,
                          recordLibrary,
                          userId
                      )
                    : permissionDomain.getDefaultPermission();
            }

            const treesAttrValues = await Promise.all(
                lib.permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties(permTreeAttr);
                    return valueRepo.getValues(recordLibrary, recordId, permTreeAttrProps);
                })
            );

            const valuesByAttr = treesAttrValues.reduce((allVal, treeVal, i) => {
                allVal[lib.permissions_conf.permissionTreeAttributes[i]] = treeVal.map(v => v.value);

                return allVal;
            }, {});

            const perm = await treePermissionDomain.getTreePermission({
                type: PermissionTypes.RECORD,
                action,
                userId,
                applyTo: recordLibrary,
                treeValues: valuesByAttr,
                permissions_conf: lib.permissions_conf,
                getDefaultPermission: params =>
                    permissionDomain.getLibraryPermission(params.action, params.applyTo, params.userId)
            });

            return perm;
        },
        async getHeritedRecordPermission(
            action: PermissionsActions,
            userGroupId: number,
            recordLibrary: string,
            permTree: string,
            permTreeNode: {id: number; library: string}
        ): Promise<boolean> {
            const getDefaultPermission = async (params: IGetDefaultPermissionParams) => {
                const {applyTo, userGroups} = params;

                const libPerm = await permissionDomain.getPermissionByUserGroups(
                    PermissionTypes.LIBRARY,
                    action,
                    userGroups,
                    applyTo
                );

                return libPerm !== null ? libPerm : permissionDomain.getDefaultPermission();
            };

            return treePermissionDomain.getHeritedTreePermission({
                type: PermissionTypes.RECORD,
                applyTo: recordLibrary,
                action,
                userGroupId,
                permissionTreeTarget: {tree: permTree, ...permTreeNode},
                getDefaultPermission
            });
        }
    };
}
