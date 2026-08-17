import {CommonAttributes, SdoAttributes} from '../../_constants/systemAttributes';
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
    type ISDOExportMappingFunctions,
    type ISDOExportMappingFunction,
    type IExtendSDOFunctions,
    type IExtendSDOFunction,
    type ISDOTriggerTarget,
    type ISDOMappingAttribute,
    sdoIdentifierBlock,
    NATIVE_SDO_EXPORT_FUNCTIONS,
} from '../../_types/sdo';
import {type IDTOStatement, type IDTO} from '../../_types/dto';
import {type IGlobalSettings} from '../../_types/globalSettings';
import {AttributeTypes, type IAttribute} from '../../_types/attribute';
import {type IValue, type ILinkValue, type IStandardValue, type ITreeValue} from '../../_types/value';
import {type IGlobalSettingsDomain} from '../globalSettings/globalSettingsDomain';
import {AttributeCondition, CORE_IN_CREATION_BY, type IRecord} from '../../_types/record';
import {type IRecordDomain} from '../record/recordDomain';
import {type ISDOUtils} from '../../utils/sdo/sdo';
import {type GetAttributeByPath} from '../attribute/helpers/getAttributeByPath';
import {type IEventsManagerDomain} from '../eventsManager/eventsManagerDomain';
import {type IValueDomain} from '../value/valueDomain';
import LeavError from '../../errors/LeavError';
import {ErrorTypes} from '../../_types/errors';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IConfig} from '../../_types/config';
import {SystemLibraries} from '../../_constants/systemLibraries';
import {type GetRecordUUID} from './helpers/getRecordUUID';

export interface ISDODomainDeps {
    'core.domain.globalSettings': IGlobalSettingsDomain;
    'core.domain.record': IRecordDomain;
    'core.utils.sdo': ISDOUtils;
    'core.domain.attribute.helpers.getAttributeByPath': GetAttributeByPath;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.value': IValueDomain;
    'core.domain.sdo.helpers.getRecordUUID': GetRecordUUID;
    'core.domain.sdo.export.exportFunctions.toIDLabel': ISDOExportMappingFunction;
    config: IConfig;
}

export interface ISDODomain {
    schemaValidation: (data: ISDO['content']) => Promise<void>;
    getSDOGlobalSettings: (ctx: IQueryInfos) => Promise<ISDOSettings>;
    getRecordSDO(
        leavLibraryId: string,
        recordId: string,
        sdoMapping: ISDOMapping,
        sdoAction: SDOAction,
        ctx: IQueryInfos,
    ): Promise<ISDO | null>;
    getRecordSDOIdentifier(
        sdoMappingLibrary: ISDOMappingLibrary,
        record: IRecord,
        ctx: IQueryInfos,
    ): Promise<Record<string, unknown>>;
    resolveAdditionalLibraryTriggerTargets(
        sdoMapping: ISDOMapping,
        eventLibraryId: string,
        eventRecordId: string,
        ctx: IQueryInfos,
    ): Promise<ISDOTriggerTarget[]>;
    sendLog({
        action,
        record,
        sdo,
        dto,
        error,
        statement,
        ctx,
    }: {
        action: EventAction;
        record?: IDbPayload['topic']['record'];
        sdo?: ISDO;
        dto?: IDTO;
        error?: unknown;
        statement?: IDTOStatement | void;
        ctx: IQueryInfos;
    }): Promise<void>;
    registerSDOExportMappingFunctions: (mappingFunctions: ISDOExportMappingFunctions) => void;
    registerExtendSDOFunctions: (extendSDOFunctions: IExtendSDOFunctions) => void;
}

export default function ({
    'core.domain.record': recordDomain,
    'core.utils.sdo': sdoUtils,
    'core.domain.attribute.helpers.getAttributeByPath': getAttributeByPath,
    'core.domain.globalSettings': globalSettingsDomain,
    'core.domain.eventsManager': eventsManager,
    'core.domain.value': valueDomain,
    'core.domain.sdo.helpers.getRecordUUID': getRecordUUID,
    'core.domain.sdo.export.exportFunctions.toIDLabel': toIDLabel,
    config,
}: ISDODomainDeps): ISDODomain {
    const debug = config.sdo.debug ?? false;

    // Native functions are available from the start: naming one in the mapping is enough, no plugin to
    // write nor deploy. Plugin-registered functions land in the same registry.
    const exportMappingFunctions: Map<string, ISDOExportMappingFunction> = new Map([
        [NATIVE_SDO_EXPORT_FUNCTIONS.TO_ID_LABEL, toIDLabel],
    ]);
    const extendSDOFunctions: Map<string, IExtendSDOFunction> = new Map();

    const sendLog = async ({action, record, sdo, dto, error, statement, ctx}): Promise<void> => {
        await eventsManager.sendDatabaseEvent(
            {
                action,
                topic: {
                    record,
                },
                ...((sdo || dto || error || statement) && {metadata: {sdo, dto, error, statement}}),
            },
            ctx,
        );
    };

    const schemaValidation = async (content: ISDO['content']): Promise<void> => {
        const sdoJSONSchema = await fs.readFile(path.resolve(__dirname, './_jsonSchemas/generic.json'));
        const result = jsonschema.validate(content, JSON.parse(sdoJSONSchema.toString()));

        if (result?.errors?.length > 0) {
            debug && logger.debug(`Schema validation errors: ${result.errors.toString()}`, {content});
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

    const _getStoredValue = async (
        library: string,
        record: IRecord,
        attributePath: string,
        ctx: IQueryInfos,
    ): Promise<string | null> => {
        const values = await recordDomain.getRecordFieldValue({library, record, attributePath, ctx});
        return ((values?.[0] as IStandardValue)?.raw_payload as string) ?? null;
    };

    const getRecordSDO = async (
        leavLibraryId: string,
        recordId: string,
        sdoMapping: ISDOMapping,
        sdoAction: SDOAction,
        ctx: IQueryInfos,
    ): Promise<ISDO | null> => {
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

        if (record[CORE_IN_CREATION_BY]) {
            debug && logger.debug('[SDO] Export skipped, record in creation', {leavLibraryId, recordId});
            return null;
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

        const resolvedByLeavAttributeId = await _resolveMappedRecordValues(
            leavLibraryId,
            record,
            sdoMappingLibrary.sdoAttributes,
            ctx,
        );

        // Create sdo object
        const sdo = await _createSDO(
            record,
            sdoAction,
            sdoMappingLibrary,
            sdoLibraryId,
            resolvedByLeavAttributeId,
            ctx,
        );

        // validate SDO (json schema)
        try {
            await schemaValidation(sdo.content);
        } catch (error) {
            logger.error(`getRecordSDO JSON Schema validation error for ${leavLibraryId}/${recordId}: ${error.stack}`);
            throw error;
        }

        return sdo;
    };

    const _mapRecordAttributeValue = async (
        values: IValue[],
        attributeProperty: IAttribute,
        ctx: IQueryInfos,
    ): Promise<unknown> => {
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
                    ? getRecordUUID(simpleLinkedRecord.library, simpleLinkedRecord.id, ctx)
                    : null;
            }
            case AttributeTypes.ADVANCED_LINK: {
                const advLinksUuids = await Promise.all(
                    (values as ILinkValue[]).map(async link =>
                        link.payload ? getRecordUUID(link.payload?.library, link.payload?.id, ctx) : null,
                    ),
                );
                return attributeProperty.multiple_values ? advLinksUuids : (advLinksUuids[0] ?? null);
            }
            case AttributeTypes.TREE: {
                const treeLinkUuids = await Promise.all(
                    (values as ITreeValue[]).map(async treeValue =>
                        treeValue.payload?.record
                            ? getRecordUUID(treeValue.payload.record.library, treeValue.payload.record.id, ctx)
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

    /** What the SDO path build needs about one mapped leav attribute. */
    interface IResolvedMappedAttribute {
        attributeProps: IAttribute;
        /** Values as leav returns them, before `_mapRecordAttributeValue` flattens links/trees to uuids. */
        values: IValue[];
    }

    /**
     * Resolves the values of every mapped attribute, once per `leavAttributeId` however many SDO paths
     * target it.
     *
     * The mapped form (`_mapRecordAttributeValue`) is stored on the record, keyed by `leavAttributeId`,
     * for the SDO paths that export it directly. It is NOT computed when every path targeting that
     * attribute declares an `exportFunction`: those receive the raw values instead, so resolving uuids
     * for them would be a round of pointless db reads.
     *
     * The record is mutated on purpose (it acts as the value bag for the content build below); pass a
     * copy when the caller's record must stay untouched.
     */
    const _resolveMappedRecordValues = async (
        leavLibraryId: string,
        record: IRecord,
        sdoAttributes: ISDOMappingLibrary['sdoAttributes'],
        ctx: IQueryInfos,
    ): Promise<Map<string, IResolvedMappedAttribute>> => {
        const resolvedByLeavAttributeId = new Map<string, IResolvedMappedAttribute>();

        const entriesByLeavAttributeId = new Map<string, ISDOMappingAttribute[]>();
        for (const attr of Object.values(sdoAttributes)) {
            if (!attr.leavAttributeId) {
                continue;
            }
            entriesByLeavAttributeId.set(attr.leavAttributeId, [
                ...(entriesByLeavAttributeId.get(attr.leavAttributeId) ?? []),
                attr,
            ]);
        }

        await Promise.all(
            Array.from(entriesByLeavAttributeId).map(async ([attributePath, mappingEntries]) => {
                let attributeProps: IAttribute;
                try {
                    attributeProps = await getAttributeByPath({
                        libraryId: leavLibraryId,
                        attributePath,
                        // A mapping can target a sub-field of a period/extended attribute
                        // (e.g. "campaign_dates.from"); the carrier attribute is returned, and
                        // getRecordFieldValue navigates the payload down to that sub-field.
                        allowSubFields: true,
                        ctx,
                    });
                } catch (e) {
                    throw new LeavError(
                        ErrorTypes.INTERNAL_ERROR,
                        `attribute ${attributePath} not found in LEAV: ${e.message}`,
                    );
                }

                const values = await recordDomain.getRecordFieldValue({
                    library: leavLibraryId,
                    record,
                    attributePath,
                    ctx,
                });

                resolvedByLeavAttributeId.set(attributePath, {attributeProps, values});

                if (mappingEntries.some(entry => !entry.exportFunction)) {
                    record[attributePath] = await _mapRecordAttributeValue(values, attributeProps, ctx);
                }
            }),
        );

        return resolvedByLeavAttributeId;
    };

    /**
     * Writes the mapped values onto an SDO content, at the SDO path each mapping entry declares,
     * applying the entry's export function and format.
     */
    const _setMappedValuesOnContent = async (
        content: ISDO['content'] | Record<string, unknown>,
        record: IRecord,
        sdoAttributes: ISDOMappingLibrary['sdoAttributes'],
        resolvedByLeavAttributeId: Map<string, IResolvedMappedAttribute>,
        ctx: IQueryInfos,
    ): Promise<void> => {
        await Promise.all(
            Object.entries(sdoAttributes).map(async ([attributeKey, mappingAttribute]) => {
                const exportMappingFunction = exportMappingFunctions.get(mappingAttribute.exportFunction);

                // A named function that isn't registered is a configuration error, whether or not the
                // entry carries a leavAttributeId — silently exporting null would hide the typo.
                if (mappingAttribute.exportFunction && !exportMappingFunction) {
                    throw new LeavError(
                        ErrorTypes.INTERNAL_ERROR,
                        `Unknown mapping function ${mappingAttribute.exportFunction} for attribute ${attributeKey}`,
                    );
                }

                if (exportMappingFunction) {
                    const resolved = resolvedByLeavAttributeId.get(mappingAttribute.leavAttributeId);

                    // No leavAttributeId means a computed SDO path: the function builds the value off
                    // the record alone, so there is no source value nor carrier attribute to hand over.
                    const mappedValue = await exportMappingFunction({
                        record,
                        ...(mappingAttribute.leavAttributeId && {
                            values: resolved?.values,
                            attributeProps: resolved?.attributeProps,
                        }),
                        format: mappingAttribute.format,
                        config: mappingAttribute.exportFunctionConfig,
                        ctx,
                    });

                    _.set(content, attributeKey, _cleanValue(mappedValue, mappingAttribute.format));
                } else {
                    _.set(
                        content,
                        attributeKey,
                        _cleanValue(record[mappingAttribute.leavAttributeId], mappingAttribute.format),
                    );
                }
            }),
        );
    };

    /**
     * The `identifier` block (business identifiers of the object) as currently stored in leav, built
     * from the mapping entries targeting that block. `{}` when the mapping declares none — leav then
     * holds no business identifier for this SDO type.
     */
    const getRecordSDOIdentifier = async (
        sdoMappingLibrary: ISDOMappingLibrary,
        record: IRecord,
        ctx: IQueryInfos,
    ): Promise<Record<string, unknown>> => {
        const identifierAttributes = Object.fromEntries(
            Object.entries(sdoMappingLibrary.sdoAttributes ?? {}).filter(([sdoKey]) =>
                sdoKey.startsWith(`${sdoIdentifierBlock}.`),
            ),
        );

        if (!Object.keys(identifierAttributes).length) {
            return {};
        }

        // The resolution stores its values on the record it is given: work on a copy, the caller's
        // record (e.g. the one an import just returned) must stay untouched.
        const recordValues = {...record};

        const resolvedByLeavAttributeId = await _resolveMappedRecordValues(
            sdoMappingLibrary.leavLibraryId,
            recordValues,
            identifierAttributes,
            ctx,
        );

        const content: Record<string, unknown> = {};
        await _setMappedValuesOnContent(content, recordValues, identifierAttributes, resolvedByLeavAttributeId, ctx);

        return (content[sdoIdentifierBlock] as Record<string, unknown>) ?? {};
    };

    const _extractLinkedRecordId = (value: IValue): string | null => {
        const payload = (value as ILinkValue | ITreeValue)?.payload as {id?: string; record?: {id?: string}};
        return payload?.record?.id ?? payload?.id ?? null;
    };

    const resolveAdditionalLibraryTriggerTargets = async (
        sdoMapping: ISDOMapping,
        eventLibraryId: string,
        eventRecordId: string,
        ctx: IQueryInfos,
    ): Promise<ISDOTriggerTarget[]> => {
        const triggers = sdoUtils.getAdditionalLibraryTriggers(sdoMapping, eventLibraryId);

        const resolvedPerTrigger = await Promise.all(
            triggers.map(async trigger => {
                let values: IValue[];

                try {
                    values = await valueDomain.getRecordFieldValue({
                        library: eventLibraryId,
                        record: {id: eventRecordId, library: eventLibraryId},
                        attributePath: trigger.attributePathToTarget,
                        ctx,
                    });
                } catch (e) {
                    throw new LeavError(
                        ErrorTypes.INTERNAL_ERROR,
                        `resolveAdditionalLibraryTriggerTargets(): failed to resolve path "${trigger.attributePathToTarget}" from ${eventLibraryId}/${eventRecordId}: ${e.message}`,
                    );
                }

                // Known limitation: resolution reads the CURRENT DB state, so unlinking/repointing the
                // trigger attribute won't re-export the OLD target (it's no longer reachable from the
                // record). Handling that would require walking dataEvent.payload.before — out of scope
                // here (possible follow-up ticket).
                return values
                    .map(_extractLinkedRecordId)
                    .filter((id): id is string => id !== null)
                    .map(recordId => ({leavLibraryId: trigger.targetLeavLibraryId, recordId}));
            }),
        );

        return resolvedPerTrigger.flat();
    };

    const _createSDO = async (
        record: IRecord,
        action: SDOAction,
        sdoMappingLibrary: ISDOMappingLibrary,
        sdoLibraryId: string,
        resolvedByLeavAttributeId: Map<string, IResolvedMappedAttribute>,
        ctx: IQueryInfos,
    ): Promise<ISDO> => {
        const recordIdentity = await recordDomain.getRecordIdentity(record, ctx);

        // Application-traceability values stored on the record (TEXT attributes). All libraries carry
        // them (added by a core migration), but legacy/system libraries might not — swallow the lookup
        // error in that case rather than checking existence upfront.
        const leavLibraryId = sdoMappingLibrary.leavLibraryId;
        const _getStoredValueOrNull = async (attributePath: string): Promise<string | null> => {
            try {
                return await _getStoredValue(leavLibraryId, record, attributePath, ctx);
            } catch {
                return null;
            }
        };
        const [creatorClientId, storedApplicationIds] = await Promise.all([
            _getStoredValueOrNull(SdoAttributes.CREATOR_CLIENT_ID),
            _getStoredValueOrNull(SdoAttributes.APPLICATION_IDS),
        ]);

        let legacyApplicationIds: Record<string, unknown> = {};
        if (storedApplicationIds) {
            try {
                legacyApplicationIds = JSON.parse(storedApplicationIds);
            } catch {
                logger.warn(`[SDO] Invalid JSON in ${SdoAttributes.APPLICATION_IDS} for record ${record.id}`);
            }
        }

        const sdo: ISDO = {
            dataModelRelease: 'dataModelRelease', // TODO: tmp value
            name: sdoLibraryId,
            date: Date.now(),
            action,
            clientId: config.sdo.clientId,
            content: {
                system: {
                    systemId: record.uuid,
                    systemActive: record.active,
                    systemCreator: await getRecordUUID(SystemLibraries.USERS, record.created_by, ctx),
                    systemCreationDate: record.created_at,
                    systemLastModificator: await getRecordUUID(SystemLibraries.USERS, record.modified_by, ctx),
                    systemLastModifiedDate: record.modified_at,
                    systemLabel: await recordIdentity.getLabel?.(),
                    applicationIds: {...legacyApplicationIds, [config.sdo.applicationName]: record.id},
                    systemCreatorClientId: creatorClientId ?? config.sdo.clientId ?? null,
                    // Last modificator app is the one generating this export: computed on the fly, not stored.
                    systemLastModificatorClientId: config.sdo.clientId,
                },
            },
        };

        await _setMappedValuesOnContent(
            sdo.content,
            record,
            sdoMappingLibrary.sdoAttributes,
            resolvedByLeavAttributeId,
            ctx,
        );

        // Extend SDO function: extend the whole SDO with plugin logic that the
        // generic attribute mapping can't express (e.g. aggregate linked/trigger data). Called last so
        // it sees the fully-mapped SDO; its result is still validated by schemaValidation in getRecordSDO.
        const extendSDOFn = sdoMappingLibrary.extendSDOFunction
            ? extendSDOFunctions.get(sdoMappingLibrary.extendSDOFunction)
            : undefined;

        if (sdoMappingLibrary.extendSDOFunction && !extendSDOFn) {
            throw new LeavError(
                ErrorTypes.INTERNAL_ERROR,
                `Unknown extend SDO function ${sdoMappingLibrary.extendSDOFunction} for library ${sdoMappingLibrary.leavLibraryId}`,
            );
        }

        return extendSDOFn ? extendSDOFn(record, sdo, ctx) : sdo;
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
        getRecordSDOIdentifier,
        resolveAdditionalLibraryTriggerTargets,
        schemaValidation,
        sendLog,

        // TODO maybe create a registerSDOImportMappingFunctions to register mapping functions for import, but we could use the same mapping functions for import and export
        registerSDOExportMappingFunctions: (mappingFunctions: ISDOExportMappingFunctions) => {
            const nativeFunctionNames: string[] = Object.values(NATIVE_SDO_EXPORT_FUNCTIONS);

            for (const [functionName, mappingFunction] of Object.entries(mappingFunctions)) {
                // A plugin shadowing a native function would change what every mapping naming it
                // exports, with nothing in the config to show it. Fail loudly at registration (boot)
                // rather than at export time.
                if (nativeFunctionNames.includes(functionName)) {
                    throw new LeavError(
                        ErrorTypes.INTERNAL_ERROR,
                        `${functionName} is a native SDO export function and cannot be overridden by a plugin`,
                    );
                }

                exportMappingFunctions.set(functionName, mappingFunction);
            }
            debug &&
                logger.debug(
                    `Registered ${Object.keys(mappingFunctions).length} (${Array.from(exportMappingFunctions.keys()).join(', ')}) SDO export mapping functions`,
                );
        },

        registerExtendSDOFunctions: (fns: IExtendSDOFunctions) => {
            for (const [functionName, extendSDOFunction] of Object.entries(fns)) {
                extendSDOFunctions.set(functionName, extendSDOFunction);
            }
            debug &&
                logger.debug(
                    `Registered ${Object.keys(fns).length} (${Array.from(extendSDOFunctions.keys()).join(', ')}) extend SDO functions`,
                );
        },
    };
}
