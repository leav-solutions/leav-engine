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
import {IQueryInfos} from '_types/queryInfos';

export interface IRecordPermissionDomain {
    getRecordPermission(
        action: string,
        userId: number,
        recordLibrary: string,
        recordId: number,
        ctx: IQueryInfos
    ): Promise<boolean>;
    getHeritedRecordPermission(
        action: PermissionsActions,
        userGroupId: number,
        recordLibrary: string,
        permTree: string,
        permTreeNode: {id: string | number; library: string},
        ctx: IQueryInfos
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
            recordId: number,
            ctx: IQueryInfos
        ): Promise<boolean> {
            const lib = await libraryDomain.getLibraryProperties(recordLibrary, ctx);
            if (typeof lib.permissions_conf === 'undefined') {
                // Check if action is present in library permissions
                const isLibAction =
                    Object.values(LibraryPermissionsActions).indexOf(
                        (action as unknown) as LibraryPermissionsActions
                    ) !== -1;

                return isLibAction
                    ? permissionDomain.getLibraryPermission({
                          action: (action as unknown) as LibraryPermissionsActions,
                          libraryId: recordLibrary,
                          userId,
                          ctx
                      })
                    : permissionDomain.getDefaultPermission(ctx);
            }

            const treesAttrValues = await Promise.all(
                lib.permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties({id: permTreeAttr, ctx});
                    return valueRepo.getValues({
                        library: recordLibrary,
                        recordId,
                        attribute: permTreeAttrProps,
                        ctx
                    });
                })
            );

            const valuesByAttr = treesAttrValues.reduce((allVal, treeVal, i) => {
                allVal[lib.permissions_conf.permissionTreeAttributes[i]] = treeVal.map(v => v.value);

                return allVal;
            }, {});

            const perm = await treePermissionDomain.getTreePermission(
                {
                    type: PermissionTypes.RECORD,
                    action,
                    userId,
                    applyTo: recordLibrary,
                    treeValues: valuesByAttr,
                    permissions_conf: lib.permissions_conf,
                    getDefaultPermission: params =>
                        permissionDomain.getLibraryPermission({
                            action: params.action,
                            libraryId: params.applyTo,
                            userId: params.userId,
                            ctx
                        })
                },
                ctx
            );

            return perm;
        },
        async getHeritedRecordPermission(
            action: PermissionsActions,
            userGroupId: number,
            recordLibrary: string,
            permTree: string,
            permTreeNode: {id: number; library: string},
            ctx: IQueryInfos
        ): Promise<boolean> {
            const getDefaultPermission = async (params: IGetDefaultPermissionParams) => {
                const {applyTo, userGroups} = params;

                const libPerm = await permissionDomain.getPermissionByUserGroups({
                    type: PermissionTypes.LIBRARY,
                    action,
                    userGroupsPaths: userGroups,
                    applyTo,
                    ctx
                });

                return libPerm !== null ? libPerm : permissionDomain.getDefaultPermission(ctx);
            };

            return treePermissionDomain.getHeritedTreePermission(
                {
                    type: PermissionTypes.RECORD,
                    applyTo: recordLibrary,
                    action,
                    userGroupId,
                    permissionTreeTarget: {tree: permTree, ...permTreeNode},
                    getDefaultPermission
                },
                ctx
            );
        }
    };
}
