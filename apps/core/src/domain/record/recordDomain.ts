import {CommonAttributes} from '../../_constants/systemAttributes';
import {ErrorTypes, EventAction, localizedTranslation} from '@leav/utils';
import {type IEventsManagerDomain} from '../eventsManager/eventsManagerDomain';
import {type IValueDomain} from '../value/valueDomain';
import {type IRecordRepo} from '../../infra/record/recordRepo';
import {type IUtils} from '../../utils/utils';
import {type IListWithCursor} from '../../_types/list';
import {type ISaveValue, type IValue, type IValuesOptions} from '../../_types/value';
import {ECacheType, type ICachesService} from '../../infra/cache/cacheService';
import {Errors} from '../../_types/errors';
import PermissionError from '../../errors/PermissionError';
import {LibraryPermissionsActions, RecordPermissionsActions} from '../../_types/permissions';
import {type IQueryInfos} from '../../_types/queryInfos';
import {
    AttributeCondition,
    CORE_IN_CREATION_BY,
    type IRecord,
    type IRecordFilterLight,
    type IRecordIdentity,
} from '../../_types/record';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import {isRecordWithId, type SendRecordUpdateEventHelper} from './helpers/sendRecordUpdateEvent';
import {
    type IDuplicateRecordResult,
    type ICreateRecordResult,
    type ICreateRecordValueError,
    type IFindRecordParams,
} from './_types';
import {type IFormRepo} from '../../infra/form/formRepo';
import {type DeleteRecordHelper} from './helpers/deleteRecord';
import {type CreateRecordHelper} from './helpers/createRecord';
import {type ILogger} from '@leav/logger';
import {type FindRecordsHelper} from './helpers/findRecords';
import {type GetRecordIdentityHelper} from './helpers/getRecordIdentity';

export interface IDuplicateRecordRules {
    attributesToDuplicate?: Array<{
        attributeId: string;
        overrideValueFn?: (id: string) => Promise<string | Array<string | {valuesErrors: ICreateRecordValueError[]}>>;
    }>;
}

export interface IRecordDomain {
    activateNewRecord(params: {
        library: string;
        recordId: string;
        formId?: string;
        skipVerifyRequiredAttributes?: boolean;
        ctx: IQueryInfos;
    }): Promise<ICreateRecordResult>;

    createRecord(params: {
        library: string;
        values?: ISaveValue[];
        verifyRequiredAttributes?: boolean;
        skipActivate?: boolean;
        uuid?: string;
        ctx: IQueryInfos;
    }): Promise<ICreateRecordResult>;

    /**
     * Update record
     * Must be used to update metadata (modified_at, ...) only
     */
    updateRecord({
        library,
        recordData,
        ctx,
    }: {
        library: string;
        recordData: IRecord;
        ctx: IQueryInfos;
    }): Promise<IRecord>;

    deleteRecord({library, id, ctx}: {library: string; id: string; ctx: IQueryInfos}): Promise<IRecord>;

    /**
     * Search records
     * Filters to apply on records selection
     * Fields to retrieve on each records
     */
    find({params, ctx}: {params: IFindRecordParams; ctx: IQueryInfos}): Promise<IListWithCursor<IRecord>>;

    /**
     * @deprecated use valueDomain.getRecordFieldValue instead
     */
    getRecordFieldValue({
        library,
        record,
        attributePath,
        options,
        ctx,
    }: {
        library: string;
        record: IRecord;
        attributePath: string;
        options?: IValuesOptions;
        ctx: IQueryInfos;
    }): Promise<IValue[]>;

    getRecordIdentity(record: IRecord, ctx: IQueryInfos): Promise<IRecordIdentity>;

    deactivateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord>;

    activateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord>;

    deactivateRecordsBatch(params: {
        libraryId: string;
        recordsIds?: string[];
        filters?: IRecordFilterLight[];
        fulltextSearch?: string;
        ctx: IQueryInfos;
    }): Promise<IRecord[]>;

    activateRecordsBatch(params: {
        libraryId: string;
        recordsIds?: string[];
        filters?: IRecordFilterLight[];
        ctx: IQueryInfos;
    }): Promise<IRecord[]>;

    purgeInactiveRecords(params: {libraryId: string; ctx: IQueryInfos}): Promise<IRecord[]>;

    purgeRecord(params: {libraryId: string; recordId: string; ctx: IQueryInfos}): Promise<IRecord>;

    duplicateRecords(params: {
        libraryId: string;
        recordIds: string[];
        duplicateRules?: IDuplicateRecordRules;
        ctx: IQueryInfos;
    }): Promise<IDuplicateRecordResult[]>;
}

export interface IRecordDomainDeps {
    'core.infra.record': IRecordRepo;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.value': IValueDomain;
    'core.domain.permission.record': IRecordPermissionDomain;
    'core.domain.record.helpers.createRecord': CreateRecordHelper;
    'core.domain.record.helpers.deleteRecord': DeleteRecordHelper;
    'core.domain.record.helpers.findRecords': FindRecordsHelper;
    'core.domain.record.helpers.getRecordIdentity': GetRecordIdentityHelper;
    'core.domain.record.helpers.sendRecordUpdateEvent': SendRecordUpdateEventHelper;
    'core.infra.form': IFormRepo;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.infra.cache.cacheService': ICachesService;
    'core.utils.logger': ILogger;
    'core.utils': IUtils;
}

export default function ({
    'core.infra.record': recordRepo,
    'core.domain.attribute': attributeDomain,
    'core.domain.value': valueDomain,
    'core.domain.permission.record': recordPermissionDomain,
    'core.domain.record.helpers.findRecords': findRecordsHelper,
    'core.domain.record.helpers.getRecordIdentity': getRecordIdentityHelper,
    'core.domain.record.helpers.createRecord': createRecordHelper,
    'core.domain.record.helpers.deleteRecord': deleteRecordHelper,
    'core.domain.record.helpers.sendRecordUpdateEvent': sendRecordUpdateEvent,
    'core.infra.form': formRepo,
    'core.domain.eventsManager': eventsManager,
    'core.infra.cache.cacheService': cacheService,
    'core.utils.logger': logger,
    'core.utils': utils,
}: IRecordDomainDeps): IRecordDomain {
    const ret: IRecordDomain = {
        find: findRecordsHelper,
        async activateNewRecord({library, recordId, formId, skipVerifyRequiredAttributes, ctx}) {
            const hasCreatePermission = await recordPermissionDomain.getRecordPermission({
                action: RecordPermissionsActions.CREATE_RECORD,
                library,
                recordId,
                ctx,
            });

            if (!hasCreatePermission) {
                throw new PermissionError(RecordPermissionsActions.CREATE_RECORD);
            }

            const libraryAttributes = await attributeDomain.getLibraryAttributes(library, ctx);

            if (!skipVerifyRequiredAttributes) {
                const creationForm = (
                    await formRepo.getForms({
                        params: {filters: {id: formId ?? 'creation', library}, strictFilters: true, withCount: false},
                        ctx,
                    })
                ).list[0];

                const requiredAttributes = (
                    creationForm
                        ? await attributeDomain.getFormAttributes({
                              libraryId: library,
                              formId: formId ?? 'creation',
                              checkDependency: false,
                              ctx,
                          })
                        : libraryAttributes
                ).filter(attribute => attribute.required);

                const valuesByAttribute: Record<string, IValue[]> = {};
                await Promise.all(
                    (requiredAttributes ?? []).map(async attr => {
                        const values = await this.getRecordFieldValue({
                            library,
                            record: {id: recordId, library},
                            attributePath: attr.id,
                            ctx,
                        });
                        if (values?.length) {
                            if (!valuesByAttribute[attr.id]) {
                                valuesByAttribute[attr.id] = [];
                            }
                            valuesByAttribute[attr.id].push(...values);
                        }
                    }),
                );

                const missingAttributes = requiredAttributes.filter(
                    attribute =>
                        !Object.keys(valuesByAttribute).includes(attribute.id) ||
                        !valuesByAttribute[attribute.id]?.length,
                );

                if (missingAttributes.length) {
                    const valuesErrors = missingAttributes.map((attribute): ICreateRecordValueError => ({
                        type: Errors.REQUIRED_ATTRIBUTE,
                        attribute: attribute.id,
                        message: utils.translateError(
                            {
                                msg: Errors.REQUIRED_ATTRIBUTE,
                                vars: {
                                    attribute:
                                        typeof attribute.label === 'string'
                                            ? attribute.label
                                            : localizedTranslation(attribute.label, [ctx.lang]) || attribute.id,
                                },
                            },
                            ctx.lang,
                        ),
                    }));
                    return {
                        record: null,
                        valuesErrors,
                    };
                }
            }

            await valueDomain.saveValue({
                library,
                recordId,
                attribute: CommonAttributes.ACTIVE,
                value: {payload: true},
                ctx,
            });

            // The record is not in creation anymore
            const {new: record} = await recordRepo.updateRecord({
                libraryId: library,
                recordData: {
                    id: recordId,
                    [CORE_IN_CREATION_BY]: null,
                },
                ctx,
            });

            return {
                record,
                valuesErrors: null,
            };
        },
        async createRecord({
            library,
            values,
            verifyRequiredAttributes,
            skipActivate,
            uuid,
            ctx,
        }): Promise<ICreateRecordResult> {
            let createdRecord: IRecord;
            try {
                createdRecord = await createRecordHelper({library, ctx, active: false, uuid});
                // Make sure we don't have any id_value hanging on as we're on creation here
                const cleanValues = (values ?? []).map(v => ({...v, id_value: null}));

                const {errors} = await valueDomain.saveValueBatch({
                    library,
                    recordId: createdRecord.id,
                    values: cleanValues,
                    ctx,
                });

                if (errors?.length) {
                    logger.error(`Error during save values batch for record ${createdRecord.id} in createRecord`, {
                        errors,
                    });
                    await this.deleteRecord({
                        library,
                        id: createdRecord.id,
                        ctx,
                    }).catch(err => {
                        logger.verbose(`Unable to purge record ${createdRecord.id} in createRecord: ${err.message}`);
                    });

                    return {
                        record: null,
                        valuesErrors: errors.map(valueError => ({
                            type: valueError.type as ErrorTypes,
                            attribute: valueError.attribute,
                            message:
                                valueError.message ||
                                utils.translateError(
                                    {msg: valueError.type, vars: {attribute: valueError.attribute}},
                                    ctx.lang,
                                ),
                        })),
                    };
                }

                if (!skipActivate) {
                    const {valuesErrors} = await this.activateNewRecord({
                        library,
                        recordId: createdRecord.id,
                        skipVerifyRequiredAttributes: !verifyRequiredAttributes,
                        ctx,
                    });
                    if (valuesErrors?.length) {
                        logger.error(`Error during activate new record ${createdRecord.id} in createRecord`, {
                            valuesErrors,
                        });
                        await this.deleteRecord({library, id: createdRecord.id, ctx}).catch(err => {
                            logger.verbose(
                                `Unable to purge record ${createdRecord.id} in createRecord: ${err.message}`,
                            );
                        });

                        return {
                            record: null,
                            valuesErrors,
                        };
                    }
                }
                return {record: createdRecord, valuesErrors: null};
            } catch (error) {
                logger.error(`Error in createRecord: ${error.stack}`);
                if (createdRecord?.id) {
                    await this.deleteRecord({library, id: createdRecord.id, ctx}).catch(err => {
                        logger.verbose(`Unable to purge record ${createdRecord.id} in createRecord: ${err.message}`);
                    });
                }
                return {
                    record: null,
                    valuesErrors: [
                        {
                            type: error?.type ?? ErrorTypes.INTERNAL_ERROR,
                            attribute: null,
                            library:
                                error?.type === ErrorTypes.PERMISSION_ERROR &&
                                error?.action === LibraryPermissionsActions.CREATE_RECORD
                                    ? library
                                    : undefined,
                            message: error && typeof error.message === 'string' ? error.message : String(error),
                        },
                    ],
                };
            }
        },
        async updateRecord({library, recordData, ctx}): Promise<IRecord> {
            const {old: oldRecord, new: savedRecord} = await recordRepo.updateRecord({
                libraryId: library,
                recordData,
                ctx,
            });

            await eventsManager.sendDatabaseEvent<EventAction.RECORD_SAVE>(
                {
                    action: EventAction.RECORD_SAVE,
                    topic: {
                        record: {
                            id: savedRecord.id,
                            libraryId: savedRecord.library,
                        },
                    },
                    before: oldRecord,
                    after: recordData,
                },
                ctx,
            );

            if (isRecordWithId(recordData)) {
                sendRecordUpdateEvent({...recordData, library}, [], ctx);
                const cacheKey = utils.getRecordsCacheKey(library, recordData.id);
                await cacheService.getCache(ECacheType.RAM).deleteData([cacheKey]);
            }

            return savedRecord;
        },
        async deleteRecord({library, id, ctx}): Promise<IRecord> {
            return deleteRecordHelper(library, id, ctx);
        },
        getRecordIdentity: getRecordIdentityHelper,
        getRecordFieldValue: valueDomain.getRecordFieldValue,
        async deactivateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord> {
            const savedValues = await valueDomain.saveValue({
                library: record.library,
                recordId: record.id,
                attribute: CommonAttributes.ACTIVE,
                value: {payload: false},
                ctx,
            });

            return {...record, active: savedValues[0].payload};
        },
        async activateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord> {
            const savedValues = await valueDomain.saveValue({
                library: record.library,
                recordId: record.id,
                attribute: CommonAttributes.ACTIVE,
                value: {payload: true},
                ctx,
            });

            return {...record, active: savedValues[0].payload};
        },
        async activateRecordsBatch({libraryId, recordsIds, filters, ctx}) {
            let recordsToActivate: string[] = recordsIds ?? [];

            if (filters) {
                const records = await findRecordsHelper({
                    params: {
                        library: libraryId,
                        filters,
                        options: {forceArray: true, forceGetAllValues: true},
                        retrieveInactive: true,
                        withCount: false,
                    },
                    ctx,
                });
                recordsToActivate = records.list.map(record => record.id);
            }

            recordsToActivate = await Promise.all(
                recordsToActivate.map(async recordId => {
                    const hasCreatePermission = await recordPermissionDomain.getRecordPermission({
                        action: RecordPermissionsActions.CREATE_RECORD,
                        library: libraryId,
                        recordId,
                        ctx,
                    });

                    return hasCreatePermission ? recordId : null;
                }),
            );

            recordsToActivate = recordsToActivate.filter(recordId => recordId !== null);

            return Promise.all(
                recordsToActivate.map(recordId => this.activateRecord({id: recordId, library: libraryId}, ctx)),
            );
        },
        async deactivateRecordsBatch({libraryId, recordsIds, filters, fulltextSearch, ctx}) {
            let recordsToDeactivate: string[] = recordsIds ?? [];

            if (filters || fulltextSearch) {
                const records = await findRecordsHelper({
                    params: {
                        library: libraryId,
                        filters,
                        fulltextSearch,
                        options: {forceArray: true, forceGetAllValues: true},
                        retrieveInactive: false,
                        withCount: false,
                    },
                    ctx,
                });
                recordsToDeactivate = records.list.map(record => record.id);
            }

            recordsToDeactivate = await Promise.all(
                recordsToDeactivate.map(async recordId => {
                    const hasDeletePermission = await recordPermissionDomain.getRecordPermission({
                        action: RecordPermissionsActions.DELETE_RECORD,
                        library: libraryId,
                        recordId,
                        ctx,
                    });
                    return hasDeletePermission ? recordId : null;
                }),
            );
            recordsToDeactivate = recordsToDeactivate.filter(recordId => recordId !== null);

            return Promise.all(
                recordsToDeactivate.map(recordId => this.deactivateRecord({id: recordId, library: libraryId}, ctx)),
            );
        },
        async purgeInactiveRecords({libraryId, ctx}): Promise<IRecord[]> {
            const inactiveRecords = await findRecordsHelper({
                params: {
                    library: libraryId,
                    filters: [{field: CommonAttributes.ACTIVE, condition: AttributeCondition.EQUAL, value: 'false'}],
                },
                ctx,
            });

            const purgedRecords: IRecord[] = [];
            for (const record of inactiveRecords.list) {
                purgedRecords.push(
                    await this.deleteRecord({
                        library: libraryId,
                        id: record.id,
                        ctx,
                    }),
                );
            }

            return purgedRecords;
        },
        async purgeRecord({libraryId, recordId, ctx}): Promise<IRecord> {
            if (!libraryId) {
                logger.warn(`Trying to purge record ${recordId} from unknown library`);
                return null;
            }
            if (!recordId) {
                logger.warn(`Trying to purge unknown record from library ${libraryId}`);
                return null;
            }

            const record = await recordRepo.getRecord({libraryId, recordId, ctx});

            if (record == null) {
                logger.warn(`Trying to purge record ${recordId} from library ${libraryId} but record not found.`);
                return null;
            }
            if (record.active) {
                logger.warn(`Trying to purge record ${recordId} from library ${libraryId} that is active.`);
                return null;
            }

            return this.deleteRecord({
                library: libraryId,
                id: recordId,
                ctx,
            });
        },
        /**
         * Duplicates multiple records by copying specified attributes from each source record,
         * allowing override values as specified in duplicateRules.
         *
         * @param {Object} params
         * @param {string} params.libraryId - The ID of the library containing the records to duplicate.
         * @param {string[]} params.recordIds - The IDs of the records to duplicate.
         * @param {IDuplicateRecordRules} [params.duplicateRules] - Rules specifying which attributes to duplicate and override.
         * @param {IQueryInfos} params.ctx - Context information for the operation.
         * @returns {Promise<IDuplicateRecordResult[]>} An array of results for each duplicated record, including errors if any.
         *
         * Edge cases:
         * - If no attributes are provided in `duplicateRules`, new records will be created without duplicated values.
         * - If an attribute has no value in the source record and no overrideValue, it will not be duplicated for that record.
         * - If a recordId does not exist, it will be skipped.
         */
        async duplicateRecords({libraryId, recordIds, duplicateRules, ctx}): Promise<IDuplicateRecordResult[]> {
            const attributesToDuplicate = duplicateRules?.attributesToDuplicate || [];

            try {
                const allValues = await Promise.all(
                    recordIds.map(async recordId => {
                        const values = await Promise.all(
                            attributesToDuplicate.map(async ({attributeId, overrideValueFn}) => {
                                if (attributeId === undefined) {
                                    return null;
                                }
                                if (overrideValueFn !== undefined) {
                                    const overrideValue = await overrideValueFn(recordId);
                                    let value: Array<{payload: any}> = [];
                                    if (Array.isArray(overrideValue)) {
                                        if ('valuesErrors' in overrideValue && overrideValue.valuesErrors) {
                                            value = [{payload: {valuesErrors: overrideValue.valuesErrors}}];
                                        }
                                        value = overrideValue.map(payload => ({payload}));
                                    } else if (overrideValue) {
                                        value = [{payload: overrideValue}];
                                    }

                                    return {
                                        recordId,
                                        attribute: attributeId,
                                        value,
                                    };
                                }
                                const value = await valueDomain.getValues({
                                    recordId,
                                    attribute: attributeId,
                                    library: libraryId,
                                    ctx,
                                });
                                return {recordId, attribute: attributeId, value};
                            }),
                        );
                        return values.filter(Boolean).flat();
                    }),
                );
                const extractPayload = (val: IValue) => (val?.payload?.id ? val.payload.id : (val.payload ?? null));

                const processValues = (attribute: string, value: any[]): ISaveValue[] => {
                    if (!Array.isArray(value) || value.length === 0) {
                        return [];
                    }
                    return value.map(val => ({
                        id_value: null,
                        attribute,
                        payload: extractPayload(val),
                    }));
                };

                const valuesByRecordId = new Map<string, ISaveValue[]>();
                const valuesErrorsByRecordId = new Map<string, any[]>();

                allValues.flat().forEach(({recordId, attribute, value}) => {
                    // Check if value contains valuesErrors
                    if (Array.isArray(value) && value[0]?.payload?.valuesErrors) {
                        if (!valuesErrorsByRecordId.has(recordId)) {
                            valuesErrorsByRecordId.set(recordId, []);
                        }
                        valuesErrorsByRecordId.get(recordId).push(...value[0].payload.valuesErrors);
                        return;
                    }
                    if (!valuesByRecordId.has(recordId)) {
                        valuesByRecordId.set(recordId, []);
                    }
                    valuesByRecordId.get(recordId).push(...processValues(attribute, value));
                });

                const duplicatedRecords = await Promise.all(
                    Array.from(valuesByRecordId.entries()).map(async ([recordId, values]) => {
                        if (valuesErrorsByRecordId.has(recordId)) {
                            return {
                                record: null,
                                valuesErrors: valuesErrorsByRecordId.get(recordId).map(err => ({
                                    ...err,
                                    originalId: recordId,
                                })),
                            };
                        }
                        const createdRecord = await this.createRecord({
                            library: libraryId,
                            values,
                            verifyRequiredAttributes: true,
                            ctx,
                        });

                        if (createdRecord.valuesErrors) {
                            createdRecord.valuesErrors = createdRecord.valuesErrors.map(err => ({
                                ...err,
                                originalId: recordId,
                            }));
                        }
                        return createdRecord;
                    }),
                );

                return duplicatedRecords;
            } catch (error) {
                logger.error(`Error in duplicateRecords: ${error.stack}`);
                return recordIds.map(recordId => ({
                    record: null,
                    valuesErrors: [
                        {
                            type: error?.type ?? ErrorTypes.INTERNAL_ERROR,
                            attribute: error?.attribute ?? null,
                            library: error?.library,
                            message: error && typeof error.message === 'string' ? error.message : String(error),
                            originalId: recordId,
                        },
                    ],
                }));
            }
        },
    };

    return ret;
}
