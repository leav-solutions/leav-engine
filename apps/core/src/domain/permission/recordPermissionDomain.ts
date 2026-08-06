import {type GetCoreEntityByIdFunc} from '../helpers/getCoreEntityById';
import {type IAttributeWithRevLink} from '../../infra/attributeTypes/attributeTypesRepo';
import {type IValueRepo} from '../../infra/value/valueRepo';
import {type ILibrary} from '../../_types/library';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {
    LibraryPermissionsActions,
    PermissionsRelations,
    PermissionTypes,
    RecordPermissionsActions,
} from '../../_types/permissions';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';
import {type ITreeBasedPermissionHelper} from './helpers/treeBasedPermissions';
import {type ILibraryPermissionDomain} from './libraryPermissionDomain';
import {
    type IGetDefaultGlobalPermissionParams,
    type IEstimateTreeValueRecordPermissionParams,
    type IGetInheritedRecordPermissionParams,
    type IGetRecordPermissionParams,
    type IGetTreeBasedPermissionParams,
} from './_types';
import {type ITreeRepo} from '../../infra/tree/treeRepo';
import {type IRecordRepo} from '../../infra/record/recordRepo';
import {type IRecordInCreationBypassHelper} from './helpers/recordInCreationBypass';
import {type IUtils} from '../../utils/utils';

export interface IRecordPermissionDomain {
    getRecordPermission(params: IGetRecordPermissionParams): Promise<boolean>;
    getInheritedRecordPermission(params: IGetInheritedRecordPermissionParams): Promise<boolean>;
    evaluateTreeValueRecordPermission(params: IEstimateTreeValueRecordPermissionParams): Promise<boolean>;
}

const recordToLibraryPermissionsMapping: Record<RecordPermissionsActions, LibraryPermissionsActions> = {
    [RecordPermissionsActions.ACCESS_RECORD]: LibraryPermissionsActions.ACCESS_RECORD,
    [RecordPermissionsActions.ACCESS_RECORD_BY_DEFAULT]: LibraryPermissionsActions.ACCESS_RECORD,
    [RecordPermissionsActions.CREATE_RECORD]: LibraryPermissionsActions.CREATE_RECORD,
    [RecordPermissionsActions.EDIT_RECORD]: LibraryPermissionsActions.EDIT_RECORD,
    [RecordPermissionsActions.DELETE_RECORD]: LibraryPermissionsActions.DELETE_RECORD,
};

export interface IRecordPermissionDomainDeps {
    'core.domain.permission.library': ILibraryPermissionDomain;
    'core.domain.permission.helpers.treeBasedPermissions': ITreeBasedPermissionHelper;
    'core.domain.permission.helpers.permissionByUserGroups': IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.recordInCreationBypass': IRecordInCreationBypassHelper;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.helpers.getCoreEntityById': GetCoreEntityByIdFunc;
    'core.infra.value': IValueRepo;
    'core.infra.tree': ITreeRepo;
    'core.infra.record': IRecordRepo;
    'core.utils': IUtils;
}

export default function (deps: IRecordPermissionDomainDeps): IRecordPermissionDomain {
    const {
        'core.domain.permission.library': libraryPermissionDomain,
        'core.domain.permission.helpers.treeBasedPermissions': treeBasedPermissionsHelper,
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupHelper,
        'core.domain.permission.helpers.recordInCreationBypass': recordInCreationBypassHelper,
        'core.domain.attribute': attributeDomain,
        'core.domain.helpers.getCoreEntityById': getCoreEntityById,
        'core.infra.value': valueRepo,
        'core.infra.tree': treeRepo,
        'core.infra.record': recordRepo,
        'core.utils': utils,
    } = deps;

    return {
        async evaluateTreeValueRecordPermission({action, libraryId, attributeId, nodeId, ctx}): Promise<boolean> {
            const attribute = (await attributeDomain.getLibraryAttributes(libraryId, ctx)).find(
                a => a.id === attributeId,
            );

            if (!attribute) {
                throw new ValidationError({
                    [attributeId]: {
                        msg: Errors.INVALID_ATTRIBUTE_FOR_LIBRARY,
                        vars: {attribute: attributeId, library: libraryId},
                    },
                });
            }

            if (!(await treeRepo.isNodePresent({treeId: attribute.linked_tree, nodeId, ctx}))) {
                throw new ValidationError({node: Errors.UNKNOWN_NODE});
            }

            return treeBasedPermissionsHelper.getTreeBasedPermission(
                {
                    type: PermissionTypes.RECORD,
                    action,
                    applyTo: libraryId,
                    treeValues: {
                        [attributeId]: [nodeId],
                    },
                    permissions_conf: {
                        permissionTreeAttributes: [attributeId],
                        relation: PermissionsRelations.AND,
                    },
                    getDefaultPermission: () =>
                        libraryPermissionDomain.getLibraryPermission({
                            action: action as unknown as LibraryPermissionsActions,
                            libraryId,
                            ctx,
                        }),
                },
                ctx,
            );
        },
        async getRecordPermission({action, library, recordId, ctx}): Promise<boolean> {
            const libProps = await getCoreEntityById<ILibrary>('library', library, ctx);

            if (!libProps) {
                throw utils.generateExplicitValidationError(
                    'library',
                    {msg: Errors.UNKNOWN_LIBRARY, vars: {library}},
                    ctx.lang,
                );
            }

            if (
                typeof libProps.permissions_conf === 'undefined' ||
                !libProps.permissions_conf.permissionTreeAttributes.length
            ) {
                // If library permission is not extended (type RECORD), we fallback to simple LIBRARY permission
                const libraryPermissionAction = recordToLibraryPermissionsMapping[action];
                return libraryPermissionDomain.getLibraryPermission({
                    action: libraryPermissionAction,
                    libraryId: library,
                    ctx,
                });
            }

            const treesAttrValues = await Promise.all(
                libProps.permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties({id: permTreeAttr, ctx});
                    return valueRepo.getValues({
                        library,
                        recordId,
                        attribute: permTreeAttrProps as IAttributeWithRevLink,
                        ctx,
                    });
                }),
            );

            const valuesByAttr: IGetTreeBasedPermissionParams['treeValues'] = treesAttrValues.reduce(
                (allVal, treeVal, i) => {
                    allVal[libProps.permissions_conf.permissionTreeAttributes[i]] = treeVal.map(v => v.payload.id);

                    return allVal;
                },
                {},
            );

            const treeBasedPermission = await treeBasedPermissionsHelper.getTreeBasedPermission(
                {
                    type: PermissionTypes.RECORD,
                    action,
                    applyTo: library,
                    treeValues: valuesByAttr,
                    permissions_conf: libProps.permissions_conf,
                    getDefaultPermission: params =>
                        libraryPermissionDomain.getLibraryPermission({
                            action: params.action as LibraryPermissionsActions,
                            libraryId: params.applyTo,
                            ctx,
                        }),
                },
                ctx,
            );

            // Record-in-creation bypass doesn't apply to CREATE_RECORD itself, so the extension can
            // still deny creation based on the record's own classification.
            if (treeBasedPermission === false && action !== RecordPermissionsActions.CREATE_RECORD) {
                const record = await recordRepo.getRecord({libraryId: library, recordId, ctx});
                return recordInCreationBypassHelper.recordInCreationBypass(record, ctx);
            }

            return treeBasedPermission;
        },
        async getInheritedRecordPermission({
            action,
            userGroupId,
            library: recordLibrary,
            permTree,
            permTreeNode,
            ctx,
        }): Promise<boolean> {
            const _getDefaultPermission = (params: IGetDefaultGlobalPermissionParams) =>
                permByUserGroupHelper.getPermissionByUserGroups({
                    type: PermissionTypes.LIBRARY,
                    action,
                    userGroupsPaths: params.userGroups,
                    applyTo: params.applyTo,
                    ctx,
                });

            return treeBasedPermissionsHelper.getInheritedTreeBasedPermission(
                {
                    type: PermissionTypes.RECORD,
                    applyTo: recordLibrary,
                    action,
                    userGroupId,
                    permissionTreeTarget: {tree: permTree, nodeId: permTreeNode},
                    getDefaultPermission: _getDefaultPermission,
                },
                ctx,
            );
        },
    };
}
