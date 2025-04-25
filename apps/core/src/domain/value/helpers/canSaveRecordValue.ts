// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordAttributePermissionDomain} from 'domain/permission/recordAttributePermissionDomain';
import {IRecordPermissionDomain} from 'domain/permission/recordPermissionDomain';
import {IAttribute} from '_types/attribute';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {IValue} from '_types/value';
import {ErrorFieldDetail, Errors} from '../../../_types/errors';
import {RecordAttributePermissionsActions, RecordPermissionsActions} from '../../../_types/permissions';
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
        config: IConfig;
    };
}

const _canSaveMetadata = async (
    valueExists: boolean,
    library: string,
    recordId: string,
    value: IValue,
    ctx: IQueryInfos,
    deps: {recordAttributePermissionDomain: IRecordAttributePermissionDomain}
): Promise<{canSave: boolean; fields?: ErrorFieldDetail<IValue>; reason?: RecordAttributePermissionsActions}> => {
    const permToCheck = RecordAttributePermissionsActions.EDIT_VALUE;
    const errors: string[] = await Object.keys(value.metadata).reduce(async (allErrorsProm, field) => {
        const allErrors = await allErrorsProm;

        const canUpdateField = await deps.recordAttributePermissionDomain.getRecordAttributePermission(
            permToCheck,
            ctx.userId,
            field,
            library,
            recordId,
            ctx
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
        reason: permToCheck
    };
};

export default async (params: ICanSaveRecordValueParams): Promise<ICanSaveRecordValueRes> => {
    const {attributeProps, value, library, recordId, ctx, deps, keepEmpty = false} = params;

    const valueExists = doesValueExist(value, attributeProps);

    // Check permission
    const canSaveRecord = await deps.recordPermissionDomain.getRecordPermission({
        action: RecordPermissionsActions.EDIT_RECORD,
        userId: ctx.userId,
        library,
        recordId,
        ctx
    });

    if (!canSaveRecord) {
        return {canSave: false, reason: RecordPermissionsActions.EDIT_RECORD};
    }

    const permToCheck = RecordAttributePermissionsActions.EDIT_VALUE;

    const isAllowed = await deps.recordAttributePermissionDomain.getRecordAttributePermission(
        permToCheck,
        ctx.userId,
        attributeProps.id,
        library,
        recordId,
        ctx
    );

    if (!isAllowed) {
        return {canSave: false, reason: permToCheck};
    }

    // Check metadata permissions
    if (value.metadata) {
        return _canSaveMetadata(valueExists, library, recordId, value, ctx, {
            recordAttributePermissionDomain: deps.recordAttributePermissionDomain
        });
    }

    return {canSave: true};
};
