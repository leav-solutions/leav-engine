// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IAttributeDependentValuesPermissionDomain} from 'domain/permission/attributeDependentValuesPermissionDomain';
import {type IRecordAttributePermissionDomain} from 'domain/permission/recordAttributePermissionDomain';
import {type IRecordPermissionDomain} from 'domain/permission/recordPermissionDomain';
import {AttributeTypes, type IAttribute} from '../../../_types/attribute';
import {type IConfig} from '_types/config';
import {type IQueryInfos} from '_types/queryInfos';
import {type IValue} from '_types/value';
import {type ErrorFieldDetail, Errors} from '../../../_types/errors';
import {
    AttributeDependentValuesPermissionsActions,
    RecordAttributePermissionsActions,
    RecordPermissionsActions,
} from '../../../_types/permissions';
import doesValueExist from './doesValueExist';

interface ICanSaveRecordValueRes {
    canSave: boolean;
    reason?: RecordAttributePermissionsActions | RecordPermissionsActions | Errors;
    fields?: ErrorFieldDetail<IValue>;
}

interface ICanSaveRecordValueParams {
    attributeProps: IAttribute;
    value: IValue;
    library: string;
    recordId: string;
    ctx?: IQueryInfos;
    keepEmpty: boolean;
    deps: {
        recordPermissionDomain: IRecordPermissionDomain;
        recordAttributePermissionDomain: IRecordAttributePermissionDomain;
        attributeDependentValuesPermissionDomain: IAttributeDependentValuesPermissionDomain;
        config: IConfig;
    };
}

const _canSaveMetadata = async (
    valueExists: boolean,
    library: string,
    recordId: string,
    value: IValue,
    ctx: IQueryInfos,
    deps: {recordAttributePermissionDomain: IRecordAttributePermissionDomain},
): Promise<{canSave: boolean; fields?: ErrorFieldDetail<IValue>; reason?: RecordAttributePermissionsActions}> => {
    const permToCheck = RecordAttributePermissionsActions.EDIT_VALUE;
    const errors: string[] = await Object.keys(value.metadata).reduce(async (allErrorsProm, field) => {
        const allErrors = await allErrorsProm;

        const canUpdateField = await deps.recordAttributePermissionDomain.getRecordAttributePermission(
            permToCheck,
            field,
            library,
            recordId,
            ctx,
        );

        if (!canUpdateField) {
            allErrors.push(field);
        }

        return allErrors;
    }, Promise.resolve([]));

    if (!errors.length) {
        return {canSave: true};
    }

    return {
        canSave: false,
        fields: {metadata: {msg: Errors.METADATA_PERMISSION_ERROR, vars: {fields: errors.join(', ')}}},
        reason: permToCheck,
    };
};

export const IMMUTABLE_CORE_SYSTEM_FILES_ATTRIBUTE_IDS = [
    'root_key',
    'hash',
    'file_path',
    'file_name',
    'inode',
    'files_previews',
    'files_previews_status',
    'file_size',
];
export const IMMUTABLE_CORE_SYSTEM_COMMON_ATTRIBUTE_IDS = [
    'id',
    'created_by',
    'created_at',
    'modified_by',
    'modified_at',
];
export const IMMUTABLE_CORE_SYSTEM_ATTRIBUTE_IDS = [
    ...IMMUTABLE_CORE_SYSTEM_COMMON_ATTRIBUTE_IDS,
    ...IMMUTABLE_CORE_SYSTEM_FILES_ATTRIBUTE_IDS,
];

export default async (params: ICanSaveRecordValueParams): Promise<ICanSaveRecordValueRes> => {
    const {attributeProps, value, library, recordId, ctx, deps, keepEmpty = false} = params;

    if (IMMUTABLE_CORE_SYSTEM_ATTRIBUTE_IDS.includes(attributeProps.id)) {
        return {canSave: false, reason: Errors.IMMUTABLE_CORE_SYSTEM_ATTRIBUTE};
    }

    const valueExists = doesValueExist(value, attributeProps);

    // Check permission
    const canSaveRecord = await deps.recordPermissionDomain.getRecordPermission({
        action: RecordPermissionsActions.EDIT_RECORD,
        library,
        recordId,
        ctx,
    });

    if (!canSaveRecord) {
        return {canSave: false, reason: RecordPermissionsActions.EDIT_RECORD};
    }

    const permToCheck = RecordAttributePermissionsActions.EDIT_VALUE;

    const isAllowed = await deps.recordAttributePermissionDomain.getRecordAttributePermission(
        permToCheck,
        attributeProps.id,
        library,
        recordId,
        ctx,
    );

    if (!isAllowed) {
        return {canSave: false, reason: permToCheck};
    }

    if (attributeProps.type === AttributeTypes.TREE) {
        const canSetValue = await deps.attributeDependentValuesPermissionDomain.getAttributeDependentValuesPermission({
            action: AttributeDependentValuesPermissionsActions.SET_VALUE,
            attributeId: attributeProps.id,
            recordLibrary: library,
            recordId,
            valueNodeId: value.payload,
            ctx,
        });

        if (!canSetValue) {
            return {canSave: false, reason: permToCheck};
        }
    }

    // Check metadata permissions
    if (value.metadata) {
        return _canSaveMetadata(valueExists, library, recordId, value, ctx, {
            recordAttributePermissionDomain: deps.recordAttributePermissionDomain,
        });
    }

    return {canSave: true};
};
