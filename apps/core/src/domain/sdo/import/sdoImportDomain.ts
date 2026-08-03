import _ from 'lodash';
import {type ISDOImportPayload, type ISDOMappingAttribute, type ISDOMappingLibrary} from '../../../_types/sdo';
import {type IRecordDomain} from '../../record/recordDomain';
import {type ISDOUtils} from '../../../utils/sdo/sdo';
import {type ISDODomain} from '../sdoDomain';
import {AttributeCondition, type IRecord, Operator} from '../../../_types/record';
import {type ISaveBatchValueError, type IValueDomain} from '../../value/valueDomain';
import {type ISDOExportDomain} from '../export/sdoExportDomain';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {
    type ILinkValue,
    type IStandardValue,
    type ISaveValue,
    type ITreeValue,
    type ISaveLinkValue,
    type ISaveStandardValue,
    type ISaveTreeValue,
} from '../../../_types/value';
import {ErrorTypes, type ErrorFieldDetail} from '../../../_types/errors';
import {type ICreateRecordValueError} from '../../record/_types';
import LeavError from '../../../errors/LeavError';
import {AttributeTypes, type IAttribute} from '../../../_types/attribute';
import {type ITreeDomain} from '../../tree/treeDomain';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {logger} from '@leav/logger';
import {IMMUTABLE_CORE_SYSTEM_ATTRIBUTE_IDS} from '../../value/helpers/canSaveRecordValue';
import {CommonAttributes, SdoAttributes} from '../../../_constants/systemAttributes';
import {type IConfig} from '../../../_types/config';

export interface ISDOImportDomainDeps {
    'core.utils.sdo': ISDOUtils;
    'core.domain.sdo': ISDODomain;
    'core.domain.value': IValueDomain;
    'core.domain.sdo.export': ISDOExportDomain;
    'core.domain.record': IRecordDomain;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.tree': ITreeDomain;
    config: IConfig;
}

export interface ISDOImportDomain {
    create: (sdo: ISDOImportPayload, ctx: IQueryInfos) => Promise<void>;
    update: (sdo: ISDOImportPayload, ctx: IQueryInfos) => Promise<void>;
}

export default function ({
    'core.utils.sdo': sdoUtils,
    'core.domain.record': recordDomain,
    'core.domain.value': valueDomain,
    'core.domain.sdo': sdoDomain,
    'core.domain.attribute': attributeDomain,
    'core.domain.tree': treeDomain,
    config,
}: ISDOImportDomainDeps): ISDOImportDomain {
    const debug = config.sdo.debug ?? false;

    const create = async (sdo: ISDOImportPayload, ctx: IQueryInfos) => {
        const sdoGlobalSettings = await sdoDomain.getSDOGlobalSettings(ctx);
        const leavLibraryId = sdoUtils.getLeavLibraryId(sdoGlobalSettings.mapping, sdo);
        const sdoLibrary = sdoUtils.getSDOLibrary(sdoGlobalSettings.mapping, leavLibraryId);

        const recordUuid = sdoUtils.getRecordUUIDFromSDO(sdo);
        const records = await _findRecords(leavLibraryId, recordUuid, ctx);

        // If we find a record, it's already created, so we skip it
        if (records.length) {
            debug &&
                logger.debug(
                    `Record with uuid "${recordUuid}" on library "${leavLibraryId}" already exists, import create skipped`,
                );

            return;
        }

        let valuesToSave = await _mapRecordValuesFromSDO(sdo, sdoLibrary, ctx);

        // filter out immutable core system attributes to avoid create record failure
        valuesToSave = valuesToSave.filter(value => !IMMUTABLE_CORE_SYSTEM_ATTRIBUTE_IDS.includes(value.attribute));
        // activation on create is handled via skipActivate below, not via a generic value save
        valuesToSave = valuesToSave.filter(value => value.attribute !== CommonAttributes.ACTIVE);

        logger.verbose(
            `SDO Import create on record ${leavLibraryId}/${recordUuid}`,
            (debug && {
                valuesToSave,
            }) ||
                {},
        );

        const res = await recordDomain.createRecord({
            library: leavLibraryId,
            values: valuesToSave,
            verifyRequiredAttributes: true,
            skipActivate: !sdo.content.system.systemActive,
            uuid: sdo.content.system.systemId,
            ctx,
        });

        if (res.valuesErrors) {
            throw new LeavError(ErrorTypes.INTERNAL_ERROR, 'Error while creating a record', {
                fields: res.valuesErrors.reduce(
                    (acc: ErrorFieldDetail<unknown>, valueError: ICreateRecordValueError) => {
                        acc[valueError.attribute] = valueError.message;
                        return acc;
                    },
                    {} as ErrorFieldDetail<unknown>,
                ),
            });
        }
    };

    const update = async (sdo: ISDOImportPayload, ctx: IQueryInfos) => {
        const sdoGlobalSettings = await sdoDomain.getSDOGlobalSettings(ctx);
        const leavLibraryId = sdoUtils.getLeavLibraryId(sdoGlobalSettings.mapping, sdo);
        const sdoLibrary = sdoUtils.getSDOLibrary(sdoGlobalSettings.mapping, leavLibraryId);

        const recordUuid = sdoUtils.getRecordUUIDFromSDO(sdo);
        const records = await _findRecords(leavLibraryId, recordUuid, ctx);

        if (!records?.length) {
            throw new Error(
                `Record with uuid "${recordUuid}" on library "${leavLibraryId}" not found, cannot process import update`,
            );
        }

        let valuesToSave = await _mapRecordValuesFromSDO(sdo, sdoLibrary, ctx, records[0]);

        // filter out immutable core system attributes to avoid update system informations
        valuesToSave = valuesToSave.filter(value => !IMMUTABLE_CORE_SYSTEM_ATTRIBUTE_IDS.includes(value.attribute));

        logger.verbose(
            `SDO Import update on record ${leavLibraryId}/${recordUuid}/${records[0].id}`,
            (debug && {
                valuesToSave,
            }) ||
                {},
        );

        const res = await valueDomain.saveValueBatch({
            library: leavLibraryId,
            recordId: records[0].id,
            values: valuesToSave,
            ctx,
        });

        if (res.errors) {
            throw new LeavError(ErrorTypes.INTERNAL_ERROR, 'Error while updating a record', {
                fields: res.errors.reduce((acc: ErrorFieldDetail<unknown>, valueError: ISaveBatchValueError) => {
                    acc[valueError.attribute] = valueError.message;
                    return acc;
                }, {} as ErrorFieldDetail<unknown>),
            });
        }
    };

    const _findRecords = async (leavLibraryId: string, recordUuid: string, ctx: IQueryInfos) => {
        const {list: records} = await recordDomain.find({
            params: {
                library: leavLibraryId,
                filters: [
                    {
                        field: CommonAttributes.UUID,
                        value: recordUuid,
                        condition: AttributeCondition.EQUAL,
                    },
                ],
                retrieveInactive: true,
            },
            ctx,
        });

        return records;
    };

    const _getRecordsIdByUUID = async (
        libraryId: string,
        recordsUUID: string[],
        ctx: IQueryInfos,
    ): Promise<string[]> => {
        if (recordsUUID.length === 0) {
            return [];
        }
        const recordsId = (
            await recordDomain.find({
                params: {
                    library: libraryId,
                    filters: recordsUUID.reduce((acc, recordUUID, index) => {
                        if (index > 0) {
                            acc.push({operator: Operator.OR});
                        }

                        const filter = {
                            field: CommonAttributes.UUID,
                            condition: AttributeCondition.EQUAL,
                            value: recordUUID,
                        };
                        acc.push(filter);
                        return acc;
                    }, []),
                    retrieveInactive: true,
                },
                ctx,
            })
        ).list.map(({id}) => id);

        if (recordsId.length !== recordsUUID.length) {
            throw new LeavError(
                ErrorTypes.INTERNAL_ERROR,
                `Records with ${_.difference(recordsUUID, recordsId)} UUID for library ${libraryId} not found`,
            );
        }

        return recordsId;
    };

    const _mapRecordValuesFromSDO = async (
        sdo: ISDOImportPayload,
        sdoMappingLibrary: ISDOMappingLibrary,
        ctx: IQueryInfos,
        record?: IRecord,
    ): Promise<ISaveValue[]> => {
        const valuesToSave: Array<Promise<ISaveValue[]>> = Object.entries(sdoMappingLibrary.sdoAttributes)
            .filter(([, sdoAttr]) => sdoAttr.leavAttributeId !== '')
            // A path (e.g. "category.color") can't be resolved to a single writable attribute — skip it.
            .filter(([, sdoAttr]) => !sdoAttr.leavAttributeId.includes('.'))
            .filter(([sdoKey]) => {
                const value = _.get(sdo.content, sdoKey);
                return value !== undefined && value !== '';
            })
            .map(async ([sdoKey, sdoAttr]): Promise<ISaveValue[]> => {
                const sdoPayload = _cleanValue(_.get(sdo.content, sdoKey));

                const attributeProperties = await attributeDomain.getAttributeProperties({
                    id: sdoAttr.leavAttributeId,
                    ctx,
                });

                // If the value is a reference to another record, we need to use its leav ID instead
                switch (attributeProperties.type) {
                    case AttributeTypes.SIMPLE:
                        return _getSaveValuesForSimpleAttribute(sdoAttr, sdoPayload);
                    case AttributeTypes.ADVANCED:
                        return _getSaveValuesForAdvancedAttribute(
                            sdoKey,
                            sdoAttr,
                            sdoPayload,
                            attributeProperties,
                            record,
                            ctx,
                        );
                    case AttributeTypes.SIMPLE_LINK:
                        return _getSaveValuesForSimpleLinkAttribute(
                            sdoKey,
                            sdoAttr,
                            sdoPayload as string,
                            attributeProperties,
                            ctx,
                        );
                    case AttributeTypes.ADVANCED_LINK:
                        return _getSaveValuesForAdvancedLinkAttribute(
                            sdoKey,
                            sdoAttr,
                            sdoPayload as string | string[],
                            attributeProperties,
                            record,
                            ctx,
                        );
                    case AttributeTypes.TREE:
                        return _getSaveValuesForTreeAttribute(
                            sdoKey,
                            sdoAttr,
                            sdoPayload as string | string[],
                            attributeProperties,
                            record,
                            ctx,
                        );
                    default:
                        throw new LeavError(
                            ErrorTypes.INTERNAL_ERROR,
                            `Unsupported attribute type ${attributeProperties.type} for attribute ${sdoKey}`,
                        );
                }
            });
        const mappedValues = (await Promise.all(valuesToSave)).flat(1);

        // LEAVC-871: persist the SDO's system.applicationIds (legacy per-application ids) into the
        // dedicated sdo_application_ids system attribute (stored as a JSON string) when present.
        const applicationIds = sdo.content.system?.applicationIds;
        if (applicationIds !== undefined && applicationIds !== null) {
            mappedValues.push({
                id_value: null,
                attribute: SdoAttributes.APPLICATION_IDS,
                payload: JSON.stringify(applicationIds),
            });
        }

        // LEAVC-871: persist the SDO's originating creator clientId (system.systemCreatorClientId)
        // into the dedicated sdo_creator_client_id system attribute when present.
        const creatorClientId = sdo.content.system?.systemCreatorClientId;
        if (creatorClientId !== undefined && creatorClientId !== null) {
            mappedValues.push({
                id_value: null,
                attribute: SdoAttributes.CREATOR_CLIENT_ID,
                payload: creatorClientId,
            });
        }

        // Persist the SDO's activation state (system.systemActive) onto the leav record's active flag.
        const systemActive = sdo.content.system?.systemActive;
        if (systemActive !== undefined && systemActive !== null) {
            mappedValues.push({
                id_value: null,
                attribute: CommonAttributes.ACTIVE,
                payload: systemActive,
            });
        }

        return mappedValues;
    };

    function _getSaveValuesForSimpleAttribute(sdoAttr: ISDOMappingAttribute, sdoPayload: unknown): ISaveValue[] {
        if (Array.isArray(sdoPayload)) {
            throw new LeavError(
                ErrorTypes.INTERNAL_ERROR,
                `Simple attribute ${sdoAttr.leavAttributeId} expects a single value`,
            );
        }
        return [
            {
                id_value: null,
                attribute: sdoAttr.leavAttributeId,
                payload: sdoPayload as ISaveValue['payload'],
            },
        ];
    }

    async function _getSaveValuesForSimpleLinkAttribute(
        sdoKey: string,
        sdoAttr: ISDOMappingAttribute,
        sdoPayload: string | string[],
        attributeProperties: IAttribute,
        ctx: IQueryInfos,
    ): Promise<ISaveLinkValue[]> {
        if (sdoPayload === null) {
            return [
                {
                    id_value: null,
                    attribute: sdoAttr.leavAttributeId,
                    payload: null,
                },
            ];
        }
        if (typeof sdoPayload !== 'string') {
            throw new LeavError(ErrorTypes.INTERNAL_ERROR, `Simple link attribute ${sdoKey} expects a string value`);
        }
        const [recordId] = await _getRecordsIdByUUID(attributeProperties.linked_library, [sdoPayload as string], ctx);
        return [
            {
                id_value: null,
                attribute: sdoAttr.leavAttributeId,
                payload: recordId,
            },
        ];
    }

    async function _getSaveValuesForAdvancedAttribute(
        sdoKey: string,
        sdoAttr: ISDOMappingAttribute,
        sdoPayload: unknown,
        attributeProperties: IAttribute,
        record: IRecord,
        ctx: IQueryInfos,
    ): Promise<ISaveStandardValue[]> {
        if (attributeProperties.multiple_values && !Array.isArray(sdoPayload)) {
            throw new LeavError(ErrorTypes.INTERNAL_ERROR, `Advanced attribute ${sdoKey} expects an array of values`);
        }
        if (!attributeProperties.multiple_values && Array.isArray(sdoPayload)) {
            throw new LeavError(ErrorTypes.INTERNAL_ERROR, `Advanced attribute ${sdoKey} expects a single value`);
        }
        const newValues = Array.isArray(sdoPayload)
            ? sdoPayload
            : sdoPayload == null // unset mono value
              ? []
              : [sdoPayload];

        if (!attributeProperties.multiple_values && newValues.length === 1) {
            // We dont need to fetch existing values if we are setting a single value
            // SaveValuesBatch will automatically replace previous value
            // Important to do in one operation in case of required attribute
            return [
                {
                    id_value: null,
                    attribute: sdoAttr.leavAttributeId,
                    payload: newValues[0],
                },
            ];
        }

        const existingValues: IStandardValue[] = record
            ? await recordDomain.getRecordFieldValue({
                  record,
                  library: record.library,
                  attributePath: sdoAttr.leavAttributeId,
                  ctx,
              })
            : [];

        const valuesToDelete = existingValues.filter(existingValue => !newValues.includes(existingValue.raw_payload));
        const valuesToAdd = newValues.filter(
            newValue => !existingValues.some(existingValue => existingValue.raw_payload === newValue),
        );

        return [
            ...valuesToDelete.map(valueToDelete => ({
                id_value: valueToDelete.id_value,
                attribute: sdoAttr.leavAttributeId,
                payload: null, // We set the payload to null to delete the value
            })),
            ...valuesToAdd.map(valueToAdd => ({
                id_value: null,
                attribute: sdoAttr.leavAttributeId,
                payload: valueToAdd,
            })),
        ];
    }

    async function _getSaveValuesForAdvancedLinkAttribute(
        sdoKey: string,
        sdoAttr: ISDOMappingAttribute,
        sdoPayload: string | string[],
        attributeProperties: IAttribute,
        record: IRecord,
        ctx: IQueryInfos,
    ): Promise<ISaveLinkValue[]> {
        if (attributeProperties.multiple_values && !Array.isArray(sdoPayload)) {
            throw new LeavError(
                ErrorTypes.INTERNAL_ERROR,
                `Advanced link attribute ${sdoKey} expects an array of string values`,
            );
        }
        if (!attributeProperties.multiple_values && Array.isArray(sdoPayload)) {
            throw new LeavError(
                ErrorTypes.INTERNAL_ERROR,
                `Advanced link attribute ${sdoKey} expects a single string value`,
            );
        }
        const recordUuids = Array.isArray(sdoPayload)
            ? sdoPayload
            : sdoPayload == null // unset mono value
              ? []
              : [sdoPayload];
        const recordsId = await _getRecordsIdByUUID(attributeProperties.linked_library, recordUuids, ctx);

        if (!attributeProperties.multiple_values && recordsId.length === 1) {
            // We dont need to fetch existing values if we are setting a single value
            // SaveValuesBatch will automatically replace previous value
            // Important to do in one operation in case of required attribute
            return [
                {
                    id_value: null,
                    attribute: sdoAttr.leavAttributeId,
                    payload: recordsId[0],
                },
            ];
        }

        const existingValues: ILinkValue[] = record
            ? await recordDomain.getRecordFieldValue({
                  record,
                  library: record.library,
                  attributePath: sdoAttr.leavAttributeId,
                  ctx,
              })
            : [];

        const valuesToDelete = existingValues.filter(val => !recordsId.includes(val.payload.id));
        const recordIdsToAdd = recordsId.filter(recordId => !existingValues.some(val => val.payload.id === recordId));

        return [
            ...valuesToDelete.map(valueToDelete => ({
                id_value: valueToDelete.id_value,
                attribute: sdoAttr.leavAttributeId,
                payload: null, // We set the payload to null to delete the value
            })),
            ...recordIdsToAdd.map(recordIdToAdd => ({
                id_value: null,
                attribute: sdoAttr.leavAttributeId,
                payload: recordIdToAdd,
            })),
        ];
    }

    async function _getSaveValuesForTreeAttribute(
        sdoKey: string,
        sdoAttr: ISDOMappingAttribute,
        sdoPayload: string | string[],
        attributeProperties: IAttribute,
        record: IRecord,
        ctx: IQueryInfos,
    ): Promise<ISaveTreeValue[]> {
        if (attributeProperties.multiple_values && !Array.isArray(sdoPayload)) {
            throw new LeavError(
                ErrorTypes.INTERNAL_ERROR,
                `Tree attribute ${sdoKey} expects an array of string values`,
            );
        }
        if (!attributeProperties.multiple_values && Array.isArray(sdoPayload)) {
            throw new LeavError(ErrorTypes.INTERNAL_ERROR, `Tree attribute ${sdoKey} expects a single string value`);
        }
        const treeProperties = await treeDomain.getTreeProperties(attributeProperties.linked_tree, ctx);
        if (Object.keys(treeProperties.libraries).length !== 1) {
            throw new LeavError(
                ErrorTypes.INTERNAL_ERROR,
                `Tree attribute ${sdoKey} expects a single library, found ${Object.keys(treeProperties.libraries).length}`,
            );
        }
        const linkedLibraryId = Object.keys(treeProperties.libraries)[0];
        const recordUuids = Array.isArray(sdoPayload)
            ? sdoPayload
            : sdoPayload == null // unset mono value
              ? []
              : [sdoPayload];
        const recordsId = await _getRecordsIdByUUID(linkedLibraryId, recordUuids, ctx);

        const nodeIds = (
            await Promise.all(
                recordsId.map(recordId =>
                    treeDomain.getNodesByRecord({
                        treeId: attributeProperties.linked_tree,
                        record: {
                            library: linkedLibraryId,
                            id: recordId,
                        },
                        ctx,
                    }),
                ),
            )
        ).flat(1);

        // One record can be referenced by multiple nodes
        if (nodeIds.length < recordsId.length) {
            throw new LeavError(
                ErrorTypes.INTERNAL_ERROR,
                `Tree attribute ${sdoKey} expects at least one node, found none for records ${JSON.stringify(recordUuids)}`,
            );
        }

        // check recordUuids instead of nodeIds because a record may be mapped to multiple nodes
        if (!attributeProperties.multiple_values && recordUuids.length === 1) {
            // We dont need to fetch existing values if we are setting a single value
            // SaveValuesBatch will automatically replace previous value
            // Important to do in one operation in case of required attribute
            return [
                {
                    id_value: null,
                    attribute: sdoAttr.leavAttributeId,
                    payload: nodeIds[0],
                },
            ];
        }

        const existingValues: ITreeValue[] = record
            ? ((await recordDomain.getRecordFieldValue({
                  record,
                  library: record.library,
                  attributePath: sdoAttr.leavAttributeId,
                  ctx,
              })) as ITreeValue[])
            : [];

        const valuesToDelete = existingValues.filter(val => !nodeIds.includes(val.payload.id));
        const nodeIdsToAdd = nodeIds.filter(nodeId => !existingValues.some(val => val.payload.id === nodeId));

        return [
            ...valuesToDelete.map(valueToDelete => ({
                id_value: valueToDelete.id_value,
                attribute: sdoAttr.leavAttributeId,
                payload: null, // We set the payload to null to delete the value
            })),
            ...nodeIdsToAdd.map(recordIdToAdd => ({
                id_value: null,
                attribute: sdoAttr.leavAttributeId,
                payload: recordIdToAdd,
            })),
        ];
    }

    const _cleanValue = (value): unknown => {
        if (value === null) {
            return null;
        }
        switch (typeof value) {
            case 'object':
                return Array.isArray(value) ? value.map(v => v.toString()) : JSON.stringify(value);
            case 'string':
                return value;
            case 'boolean':
                return value;
            default:
                return String(value);
        }
    };

    return {
        create,
        update,
    };
}
