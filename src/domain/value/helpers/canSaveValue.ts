import {IAttributePermissionDomain} from 'domain/permission/attributePermissionDomain';
import {IRecordPermissionDomain} from 'domain/permission/recordPermissionDomain';
import {IAttribute} from '_types/attribute';
import {IQueryInfos} from '_types/queryInfos';
import {IValue} from '_types/value';
import {ErrorFieldDetail, Errors} from '../../../_types/errors';
import {AttributePermissionsActions, RecordPermissionsActions} from '../../../_types/permissions';
import doesValueExist from './doesValueExist';

interface ICanSaveValueRes {
    canSave: boolean;
    reason?: AttributePermissionsActions | RecordPermissionsActions;
    fields?: ErrorFieldDetail<IValue>;
}

interface ICanSaveValueParams {
    attributeProps: IAttribute;
    value: IValue;
    library: string;
    recordId: number;
    infos?: IQueryInfos;
    keepEmpty: boolean;
    deps: {
        recordPermissionDomain: IRecordPermissionDomain;
        attributePermissionDomain: IAttributePermissionDomain;
    };
}

const _canSaveMetadata = async (
    valueExists: boolean,
    library: string,
    recordId: number,
    value: IValue,
    infos: IQueryInfos,
    deps: {attributePermissionDomain: IAttributePermissionDomain}
): Promise<{canSave: boolean; fields?: ErrorFieldDetail<IValue>; reason?: AttributePermissionsActions}> => {
    const permToCheck = valueExists ? AttributePermissionsActions.EDIT_VALUE : AttributePermissionsActions.CREATE_VALUE;
    const errors: string[] = await Object.keys(value.metadata).reduce(async (allErrorsProm, field) => {
        const allErrors = await allErrorsProm;

        const canUpdateField = await deps.attributePermissionDomain.getAttributePermission(
            permToCheck,
            infos.userId,
            field,
            library,
            recordId
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

export default async (params: ICanSaveValueParams): Promise<ICanSaveValueRes> => {
    const {attributeProps, value, library, recordId, infos, deps, keepEmpty = false} = params;
    const valueExists = doesValueExist(value, attributeProps);

    // Check permission
    const canUpdateRecord = await deps.recordPermissionDomain.getRecordPermission(
        RecordPermissionsActions.EDIT,
        infos.userId,
        library,
        recordId
    );

    if (!canUpdateRecord) {
        return {canSave: false, reason: RecordPermissionsActions.EDIT};
    }

    const permToCheck =
        !keepEmpty && !value.value
            ? AttributePermissionsActions.DELETE_VALUE
            : valueExists
            ? AttributePermissionsActions.EDIT_VALUE
            : AttributePermissionsActions.CREATE_VALUE;

    const isAllowed = await deps.attributePermissionDomain.getAttributePermission(
        permToCheck,
        infos.userId,
        attributeProps.id,
        library,
        recordId
    );

    if (!isAllowed) {
        return {canSave: false, reason: permToCheck};
    }

    // Check metadata permissions
    if (value.metadata) {
        return _canSaveMetadata(valueExists, library, recordId, value, infos, {
            attributePermissionDomain: deps.attributePermissionDomain
        });
    }

    return {canSave: true};
};
