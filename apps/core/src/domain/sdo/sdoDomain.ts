import {CommonAttributes} from '../../_constants/systemAttributes';
import fs from 'fs/promises';
import path from 'path';
import jsonschema from 'jsonschema';
import _ from 'lodash';
import {logger} from '@leav/logger';
import {type IDbPayload, type EventAction} from '@leav/utils';
import {
    type SDOAction,
    type ISDO,
    type ISDOMappingLibrary,
    type ISDOMapping,
    type ISDOSettings,
    type ISDOMappingFunctions,
    type ISDOMappingFunction,
} from '../../_types/sdo';
import {type IGlobalSettings} from '../../_types/globalSettings';
import {AttributeTypes, type IAttribute} from '../../_types/attribute';
import {type IValue, type ILinkValue, type IStandardValue, type ITreeValue} from '../../_types/value';
import ValidationError from '../../errors/ValidationError';
import {type IGlobalSettingsDomain} from '../globalSettings/globalSettingsDomain';
import {AttributeCondition, type IRecord} from '../../_types/record';
import {type IRecordDomain} from '../record/recordDomain';
import {type ISDOUtils} from '../../utils/sdo/sdo';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IEventsManagerDomain} from '../eventsManager/eventsManagerDomain';
import {type IValueDomain} from '../value/valueDomain';
import LeavError from '../../errors/LeavError';
import {ErrorTypes} from '../../_types/errors';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IRecordRepo} from '../../infra/record/recordRepo';

export interface ISDODomainDeps {
    'core.domain.globalSettings': IGlobalSettingsDomain;
    'core.domain.record': IRecordDomain;
    'core.utils.sdo': ISDOUtils;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.value': IValueDomain;
    'core.infra.record': IRecordRepo;
}

export interface ISDODomain {
    schemaValidation: (data: ISDO['content']) => Promise<void>;
    getSDOGlobalSettings: (ctx: IQueryInfos) => Promise<ISDOSettings>;
    getRecordSDO(
        leavLibraryId: string,
        recordId: string,
        sdoGlobalSettingsMapping: ISDOMapping,
        ctx: IQueryInfos,
    ): Promise<ISDO | void>;
    sendLog({
        action,
        record,
        sdo,
        error,
        ctx,
    }: {
        action: EventAction;
        record?: IDbPayload['topic']['record'];
        sdo?: ISDO;
        error?: unknown;
        ctx: IQueryInfos;
    }): Promise<void>;
    registerSDOExportMappingFunctions: (mappingFunctions: ISDOMappingFunctions) => void;
}

export const hashSDOAttributeId = 'hash_sdo';

export default function ({
    'core.domain.record': recordDomain,
    'core.utils.sdo': sdoUtils,
    'core.domain.attribute': attributeDomain,
    'core.domain.globalSettings': globalSettingsDomain,
    'core.domain.eventsManager': eventsManager,
    'core.domain.value': valueDomain,
    'core.infra.record': recordRepo,
}: ISDODomainDeps): ISDODomain {
    const exportMappingFunctions: Map<string, ISDOMappingFunction> = new Map();

    const sendLog = async ({action, record, sdo, error, ctx}): Promise<void> => {
        await eventsManager.sendDatabaseEvent(
            {
                action,
                topic: {
                    record,
                },
                ...((sdo || error) && {metadata: {sdo, error}}),
            },
            ctx,
        );
    };

    const schemaValidation = async (content: ISDO['content']): Promise<void> => {
        const sdoJSONSchema = await fs.readFile(path.resolve(__dirname, './_jsonSchemas/generic.json'));
        const result = jsonschema.validate(content, JSON.parse(sdoJSONSchema.toString()));

        if (result?.errors?.length > 0) {
            logger.debug(`Schema validation errors: ${result.errors.toString()}`, {content});
            throw new Error(`[sdoDomain::schemaValidation]: ${result.errors.toString()}`);
        }
    };

    const getSDOGlobalSettings = async (ctx: IQueryInfos): Promise<ISDOSettings> => {
        const globalSettings: IGlobalSettings = await globalSettingsDomain.getSettings(ctx);

        const sdoGlobalSettings: ISDOSettings = globalSettings?.settings?.sdo;
        if (!sdoGlobalSettings?.mapping) {
            return {importEnable: false, exportEnable: false, mapping: {}};
        }

        return sdoGlobalSettings;
    };

    const _getUUIDValue = async (libraryId: string, recordId: string, ctx: IQueryInfos): Promise<string | null> =>
        (
            await recordRepo.getRecord({
                libraryId,
                recordId,
                ctx,
            })
        )?.[CommonAttributes.UUID] ?? null;

    const getRecordSDO = async (
        leavLibraryId: string,
        recordId: string,
        sdoMapping: ISDOMapping,
        ctx: IQueryInfos,
    ): Promise<ISDO | void> => {
        // Find record in database
        const recordFilter = [
            {
                field: CommonAttributes.ID,
                value: recordId,
                condition: AttributeCondition.EQUAL,
            },
        ];
        const res = await recordDomain.find({
            params: {library: leavLibraryId, filters: recordFilter, retrieveInactive: true},
            ctx,
        });

        const record: IRecord = res?.list[0];
        if (!record || Object.keys(record).length === 0) {
            throw new Error(`Export sdo record not found ${recordId}`);
        }

        let sdoLibraryId: string;
        let sdoMappingLibrary: ISDOMappingLibrary;

        for (const [id, lib] of Object.entries(sdoMapping)) {
            if (lib.leavLibraryId === leavLibraryId) {
                sdoLibraryId = id;
                sdoMappingLibrary = lib;
                break;
            }
        }

        const attributes =
            (
                await attributeDomain.getAttributes({
                    params: {
                        filters: {
                            libraries: [leavLibraryId],
                        },
                    },
                    ctx,
                })
            )?.list || [];

        const mapRecordAttributeValue = async (values: IValue[], attributeProperty: IAttribute): Promise<unknown> => {
            switch (attributeProperty.type) {
                case AttributeTypes.SIMPLE:
                    return (values?.[0] as IStandardValue)?.raw_payload ?? null;
                case AttributeTypes.ADVANCED:
                    if (attributeProperty.multiple_values) {
                        return (values as IStandardValue[]).map(value => value.raw_payload) ?? [];
                    }
                    return (values as IStandardValue[])[0]?.raw_payload ?? null;
                case AttributeTypes.SIMPLE_LINK: {
                    const simpleLinkedRecord = (values?.[0] as ILinkValue)?.payload;
                    return simpleLinkedRecord
                        ? _getUUIDValue(simpleLinkedRecord.library, simpleLinkedRecord.id, ctx)
                        : null;
                }
                case AttributeTypes.ADVANCED_LINK: {
                    const advLinksUuids = await Promise.all(
                        (values as ILinkValue[]).map(async link =>
                            link.payload ? _getUUIDValue(link.payload?.library, link.payload?.id, ctx) : null,
                        ),
                    );
                    return attributeProperty.multiple_values ? advLinksUuids : (advLinksUuids[0] ?? null);
                }
                case AttributeTypes.TREE: {
                    const treeLinkUuids = await Promise.all(
                        (values as ITreeValue[]).map(async treeValue =>
                            treeValue.payload?.record
                                ? _getUUIDValue(treeValue.payload.record.library, treeValue.payload.record.id, ctx)
                                : null,
                        ),
                    );
                    return attributeProperty.multiple_values ? treeLinkUuids : (treeLinkUuids[0] ?? null);
                }
                default:
                    throw new LeavError(
                        ErrorTypes.INTERNAL_ERROR,
                        `getRecordSDO(): unknown type ${attributeProperty.type} for attribute ${attributeProperty.id}`,
                    );
            }
        };

        await Promise.all(
            Object.values(sdoMappingLibrary.sdoAttributes)
                .filter(attr => attr.leavAttributeId !== '')
                .map(async attr => {
                    const attributeProperty = attributes.find(a => a.id === attr.leavAttributeId);
                    if (!attributeProperty) {
                        throw new LeavError(
                            ErrorTypes.INTERNAL_ERROR,
                            `attribute ${attr.leavAttributeId} not found in LEAV`,
                        );
                    }

                    const fieldValues = await recordDomain.getRecordFieldValue({
                        library: leavLibraryId,
                        record,
                        attributeId: attr.leavAttributeId,
                        ctx,
                    });

                    record[attr.leavAttributeId] = await mapRecordAttributeValue(fieldValues, attributeProperty);
                }),
        );

        const action = record.hash_sdo == null ? 'CREATE' : 'UPDATE';

        // Create sdo object
        const sdo = await _createSDO(record, action, sdoMappingLibrary, sdoLibraryId, attributes, ctx);

        // validate SDO (json schema)
        try {
            await schemaValidation(sdo.content);
        } catch (error) {
            logger.error(`getRecordSDO JSON Schema validation error for ${leavLibraryId}/${recordId}: ${error.stack}`);
            throw error;
        }

        const hashSdo = sdoUtils.createHash(sdo);

        if (hashSdo === record.hash_sdo) {
            logger.debug(`[SDO] Same hash ${hashSdo} for ${recordId} in ${leavLibraryId}`);
            return;
        }

        // Register current hash_sdo in recordù
        await valueDomain.saveValue({
            library: leavLibraryId,
            recordId,
            attribute: hashSDOAttributeId,
            value: {
                payload: hashSdo,
            },
            ctx,
        });

        return sdo;
    };

    const _createSDO = async (
        record: IRecord,
        action: SDOAction,
        sdoMappingLibrary: ISDOMappingLibrary,
        sdoLibraryId: string,
        attributes: IAttribute[],
        ctx: IQueryInfos,
    ): Promise<ISDO> => {
        const sdo: ISDO = {
            dataModelRelease: 'dataModelRelease', // TODO: tmp value
            name: sdoLibraryId,
            date: Date.now(),
            action,
            content: {},
        };

        await Promise.all(
            Object.entries(sdoMappingLibrary.sdoAttributes).map(async ([attributeKey, mappingAttribute]) => {
                const mappingFunction = exportMappingFunctions.get(
                    mappingAttribute.exportFunction,
                ) as ISDOMappingFunction;
                if (mappingAttribute.leavAttributeId && !mappingFunction && mappingAttribute.exportFunction) {
                    throw new LeavError(
                        ErrorTypes.INTERNAL_ERROR,
                        `Unknown mapping function ${mappingAttribute.exportFunction} for attribute ${attributeKey}`,
                    );
                }

                if (mappingAttribute.leavAttributeId && mappingFunction) {
                    const attr = attributes.find(_attr => _attr.id === mappingAttribute.leavAttributeId);
                    const mappedValue = await mappingFunction(record[mappingAttribute.leavAttributeId], attr, ctx);

                    _.set(sdo.content, attributeKey, _cleanValue(mappedValue, mappingAttribute.format));
                } else {
                    _.set(
                        sdo.content,
                        attributeKey,
                        _cleanValue(record[mappingAttribute.leavAttributeId], mappingAttribute.format),
                    );
                }
            }),
        );

        return sdo;
    };

    const _cleanValue = (val, type) => {
        if (val === '' || val == null) {
            return null;
        }
        switch (type) {
            case 'number':
                return parseFloat(val) || null;
            case 'integer':
                return parseInt(val, 10) || null;
            case 'boolean':
                return !!val;
            case 'string':
                return val.toString();
            case 'array':
                return Array.isArray(val) ? val : [];
            case 'object':
                return val;
            default:
                throw new LeavError(ErrorTypes.INTERNAL_ERROR, `Unknown type ${type} in library`);
        }
    };

    return {
        getSDOGlobalSettings,
        getRecordSDO,
        schemaValidation,
        sendLog,

        // TODO maybe create a registerSDOImportMappingFunctions to register mapping functions for import, but we could use the same mapping functions for import and export
        registerSDOExportMappingFunctions: (mappingFunctions: ISDOMappingFunctions) => {
            for (const [functionName, mappingFunction] of Object.entries(mappingFunctions)) {
                exportMappingFunctions.set(functionName, mappingFunction);
            }
            logger.debug(
                `Registered ${Object.keys(mappingFunctions).length} (${Array.from(exportMappingFunctions.keys()).join(', ')}) SDO export mapping functions`,
            );
        },
    };
}
