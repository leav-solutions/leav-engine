// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorTypes, EventAction, localizedTranslation} from '@leav/utils';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {type GetCoreEntityByIdFunc} from 'domain/helpers/getCoreEntityById';
import {type IValidateHelper} from 'domain/helpers/validate';
import {type IValueDomain} from 'domain/value/valueDomain';
import {type i18n} from 'i18next';
import {type IRecordRepo} from 'infra/record/recordRepo';
import {type IUtils} from 'utils/utils';
import type * as Config from '_types/config';
import {type IListWithCursor} from '_types/list';
import {type IPreview} from '_types/preview';
import {type ISaveValue, type ITreeValue, type IValue, type IValuesOptions} from '_types/value';
import ValidationError from '../../errors/ValidationError';
import {ECacheType, type ICachesService} from '../../infra/cache/cacheService';
import {getValuesToDisplay} from '../../utils/helpers/getValuesToDisplay';
import {TypeGuards} from '../../utils';
import {AttributeFormats} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {type ILibrary, LibraryBehavior} from '../../_types/library';
import {RecordPermissionsActions} from '../../_types/permissions';
import {type IQueryInfos} from '../../_types/queryInfos';
import {
    AttributeCondition,
    CORE_IN_CREATION_BY,
    type IRecord,
    type IRecordFilterLight,
    type IRecordIdentity,
    type IRecordIdentityConf,
} from '../../_types/record';
import {type TreePath} from '../../_types/tree';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import {isRecordWithId, type SendRecordUpdateEventHelper} from './helpers/sendRecordUpdateEvent';
import {type ICreateRecordResult, type ICreateRecordValueError, type IFindRecordParams} from './_types';
import {type IFormRepo} from 'infra/form/formRepo';
import {type DeleteRecordHelper} from './helpers/deleteRecord';
import {type CreateRecordHelper} from './helpers/createRecord';
import {type IElementAncestorsHelper} from 'domain/tree/helpers/elementAncestors';
import {type ILogger} from '@leav/logger';
import {type FindRecordsHelper} from './helpers/findRecords';

export const ATTRIBUTE_ACTIVE = 'active';

export interface IDuplicateRecordRules {
    attributesToDuplicate?: Array<{
        attributeId: string;
        overrideValueFn?: (id: string) => Promise<string | Array<string | {valuesErrors: ICreateRecordValueError[]}>>;
    }>;
}

export interface IRecordDomain {
    /**
     * Create empty record
     * Used when create a record, set active to false and inCreation to true
     */
    createEmptyRecord(params: {library: string; ctx: IQueryInfos}): Promise<IRecord>;

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
        attributeId,
        options,
        ctx,
    }: {
        library: string;
        record: IRecord;
        attributeId: string;
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
    }): Promise<ICreateRecordResult[]>;
}

export interface IRecordDomainDeps {
    config: Config.IConfig;
    'core.infra.record': IRecordRepo;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.value': IValueDomain;
    'core.domain.permission.record': IRecordPermissionDomain;
    'core.domain.helpers.getCoreEntityById': GetCoreEntityByIdFunc;
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.record.helpers.createRecord': CreateRecordHelper;
    'core.domain.record.helpers.deleteRecord': DeleteRecordHelper;
    'core.domain.record.helpers.findRecords': FindRecordsHelper;
    'core.domain.record.helpers.sendRecordUpdateEvent': SendRecordUpdateEventHelper;
    'core.domain.tree.helpers.elementAncestors': IElementAncestorsHelper;
    'core.infra.form': IFormRepo;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.infra.cache.cacheService': ICachesService;
    'core.utils.logger': ILogger;
    'core.utils': IUtils;
    translator: i18n;
}

export default function ({
    config,
    'core.infra.record': recordRepo,
    'core.domain.attribute': attributeDomain,
    'core.domain.value': valueDomain,
    'core.domain.permission.record': recordPermissionDomain,
    'core.domain.record.helpers.findRecords': findRecordsHelper,
    'core.domain.helpers.getCoreEntityById': getCoreEntityById,
    'core.domain.helpers.validate': validateHelper,
    'core.domain.record.helpers.createRecord': createRecordHelper,
    'core.domain.record.helpers.deleteRecord': deleteRecordHelper,
    'core.domain.record.helpers.sendRecordUpdateEvent': sendRecordUpdateEvent,
    'core.domain.tree.helpers.elementAncestors': elementAncestorsHelper,
    'core.infra.form': formRepo,
    'core.domain.eventsManager': eventsManager,
    'core.infra.cache.cacheService': cacheService,
    'core.utils.logger': logger,
    'core.utils': utils,
    translator,
}: IRecordDomainDeps): IRecordDomain {
    const _getPreviews = async ({
        conf,
        lib,
        record,
        visitedLibraries = [],
        ctx,
    }: {
        conf: IRecordIdentityConf;
        lib: ILibrary;
        record: IRecord;
        visitedLibraries?: string[];
        ctx: IQueryInfos;
    }) => {
        visitedLibraries.push(lib.id);

        let previewRecord: IRecord;

        // On a file, previews are accessible straight on the record
        // Otherwise, we fetch values of the previews attribute
        let previewsAttributeId: string;
        let fileLibraryId: string;
        if (lib.behavior === LibraryBehavior.FILES) {
            previewRecord = record;
            previewsAttributeId = utils.getPreviewsAttributeName(lib.id);
            fileLibraryId = lib.id;
        } else {
            const previewAttribute = conf.preview;
            if (!previewAttribute) {
                return null;
            }
            const previewAttributeProps = await attributeDomain.getAttributeProperties({id: previewAttribute, ctx});

            let previewValues = await ret.getRecordFieldValue({
                library: lib.id,
                record,
                attributeId: previewAttribute,
                options: {forceArray: true, version: ctx.version},
                ctx,
            });

            previewValues = getValuesToDisplay(previewValues);

            if (!(previewValues as IValue[]).length) {
                return null;
            }

            let previewAttributeLibraryProps: ILibrary;
            try {
                previewAttributeLibraryProps = await validateHelper.validateLibrary(
                    previewAttributeProps.linked_library,
                    ctx,
                );
            } catch (e) {
                return null;
            }

            previewRecord = previewValues[0].payload;

            if (previewAttributeLibraryProps.behavior !== LibraryBehavior.FILES) {
                // To avoid infinite loop, we check if the library has already been visited. If so, we return null
                // For example, if the users' library preview is set to "created_by",
                // we'll retrieve the user's creator, then we'll retrieve the creator's creator, and so on...
                return !visitedLibraries.includes(previewAttributeLibraryProps.id)
                    ? _getPreviews({
                          record: previewRecord,
                          lib: previewAttributeLibraryProps,
                          conf: previewAttributeLibraryProps.recordIdentityConf,
                          visitedLibraries,
                          ctx,
                      })
                    : null;
            }

            previewsAttributeId = utils.getPreviewsAttributeName(previewRecord.library);
            fileLibraryId = previewRecord.library;
        }

        // Get value of the previews field. We're calling getRecordFieldValue to apply actions_list if any
        const filePreviewsValue = await ret.getRecordFieldValue({
            library: fileLibraryId,
            record: previewRecord,
            attributeId: previewsAttributeId,
            options: {forceArray: true},
            ctx,
        });

        if (!filePreviewsValue[0] || !TypeGuards.isIStandardValue(filePreviewsValue[0])) {
            return null;
        }

        const previews = filePreviewsValue[0]?.raw_payload ?? {};

        const previewsWithUrl: IPreview = Object.entries(previews)
            .map(value => {
                const [key, url] = value;

                if (!url || url.toString() === '') {
                    // avoid broken image
                    return {[key]: null};
                }

                // add host url to preview
                const absoluteUrl = utils.getPreviewUrl(url.toString());

                return {[key]: absoluteUrl};
            })
            .reduce((obj, o) => ({...obj, ...o}), {});

        previewsWithUrl.file = previewRecord;
        previewsWithUrl.original = `/${config.files.originalsPathPrefix}/${previewRecord.library}/${previewRecord.id}`;

        return previewsWithUrl;
    };

    const _getLibraryIconPreview = async (library: ILibrary, ctx: IQueryInfos) => {
        const cacheKey = `${utils.getCoreEntityCacheKey('library', library.id)}:icon_preview`;

        const _execute = async () => {
            // Retrieve library icon
            const libraryIcon = library.icon;

            if (!libraryIcon?.libraryId || !libraryIcon?.recordId) {
                return null;
            }

            const libraryIconRecord = await findRecordsHelper({
                params: {
                    library: libraryIcon.libraryId,
                    filters: [{condition: AttributeCondition.EQUAL, field: 'id', value: libraryIcon.recordId}],
                },
                ctx,
            });

            if (!libraryIconRecord?.list?.length) {
                return null;
            }

            const libraryIconLib = await getCoreEntityById<ILibrary>('library', libraryIcon.libraryId, ctx);
            return _getPreviews({
                conf: libraryIconLib.recordIdentityConf,
                lib: libraryIconLib,
                record: libraryIconRecord.list[0],
                ctx,
            });
        };

        return cacheService.memoize({key: cacheKey, func: _execute, storeNulls: true, ctx});
    };

    const _getLabel = async (record: IRecord, visitedLibraries: string[] = [], ctx: IQueryInfos): Promise<string> => {
        if (!record) {
            return null;
        }
        visitedLibraries.push(record.library);

        const lib = await validateHelper.validateLibrary(record.library, ctx);

        const conf = lib.recordIdentityConf || {};
        const valuesOptions: IValuesOptions = {
            version: ctx.version ?? null,
        };

        let label: string = null;
        if (conf.label) {
            const labelAttributeProps = await attributeDomain.getAttributeProperties({id: conf.label, ctx});

            let labelValues = await valueDomain.getValues({
                library: lib.id,
                recordId: record.id,
                attribute: conf.label,
                options: valuesOptions,
                ctx,
            });

            if (!labelValues.length) {
                return null;
            }

            labelValues = getValuesToDisplay(labelValues);

            const value: IValue['payload'] | undefined = labelValues?.[0]?.payload;

            if (utils.isLinkAttribute(labelAttributeProps)) {
                // To avoid infinite loop, we check if  the library has already been visited. If so, we return the id.
                // For example, if the users' library label is set to "created_by",
                // we'll retrieve the user's creator, then we'll retrieve the creator's creator, and so on...
                if (visitedLibraries.includes(labelAttributeProps.linked_library)) {
                    return value.id;
                }

                label = await _getLabel(value, visitedLibraries, ctx);
            } else if (utils.isTreeAttribute(labelAttributeProps)) {
                label = await _getLabel(value.record, visitedLibraries, ctx);
            } else if (labelAttributeProps.format === AttributeFormats.DATE_RANGE) {
                label = value ? _convertDateRangeToString(value, ctx) : null;
            } else {
                label = value;
            }
        }

        return label;
    };

    const _getColor = async (
        record: IRecord,
        visitedLibraries: string[] = [],
        ctx: IQueryInfos,
    ): Promise<string | null> => {
        if (!record) {
            return null;
        }
        visitedLibraries.push(record.library);

        const lib = await validateHelper.validateLibrary(record.library, ctx);

        const conf = lib.recordIdentityConf || {};
        const valuesOptions: IValuesOptions = {
            version: ctx.version ?? null,
        };

        let color: string | null = null;
        if (conf.color) {
            const colorAttributeProps = await attributeDomain.getAttributeProperties({id: conf.color, ctx});

            let colorValues = await valueDomain.getValues({
                library: lib.id,
                recordId: record.id,
                attribute: conf.color,
                options: valuesOptions,
                ctx,
            });

            colorValues = getValuesToDisplay(colorValues);

            if (!colorValues.length) {
                return null;
            }

            if (utils.isLinkAttribute(colorAttributeProps)) {
                const linkValue = colorValues.pop().payload;

                // To avoid infinite loop, we check if the library has already been visited. If so, we return null
                // For example, if the users' library color is set to "created_by",
                // we'll retrieve the user's creator, then we'll retrieve the creator's creator, and so on...
                if (visitedLibraries.includes(colorAttributeProps.linked_library)) {
                    return null;
                }

                color = await _getColor(linkValue, visitedLibraries, ctx);
            } else if (utils.isTreeAttribute(colorAttributeProps)) {
                const treeValue = colorValues.pop().payload.record;
                color = await _getColor(treeValue, visitedLibraries, ctx);
            } else {
                color = colorValues.pop().payload;
            }
        }

        return color;
    };

    const _getSubLabel = async (
        record: IRecord,
        visitedLibraries: string[] = [],
        ctx: IQueryInfos,
    ): Promise<string | null> => {
        if (!record) {
            return null;
        }
        visitedLibraries.push(record.library);

        const lib = await validateHelper.validateLibrary(record.library, ctx);

        const conf = lib.recordIdentityConf || {};
        const valuesOptions: IValuesOptions = {
            version: ctx.version ?? null,
        };
        let subLabel: string | null = null;
        if (conf.subLabel) {
            const subLabelAttributeProps = await attributeDomain.getAttributeProperties({id: conf.subLabel, ctx});

            let subLabelValues = await valueDomain.getValues({
                library: lib.id,
                recordId: record.id,
                attribute: conf.subLabel,
                options: valuesOptions,
                ctx,
            });

            subLabelValues = getValuesToDisplay(subLabelValues);

            if (conf.subLabel === 'id') {
                subLabelValues[0].payload = record.id;
            }

            if (!subLabelValues.length) {
                return null;
            }

            const value: IValue['payload'] | undefined = subLabelValues?.[0]?.payload;

            if (utils.isLinkAttribute(subLabelAttributeProps)) {
                const linkValue = value;

                // To avoid infinite loop, we check if the library has already been visited. If so, we return null
                // For example, if the users' library color is set to "created_by",
                // we'll retrieve the user's creator, then we'll retrieve the creator's creator, and so on...
                if (visitedLibraries.includes(subLabelAttributeProps.linked_library)) {
                    return null;
                }
                subLabel = await _getSubLabel(linkValue, visitedLibraries, ctx);
            } else if (utils.isTreeAttribute(subLabelAttributeProps)) {
                const treeValue = (value as ITreeValue['payload']).record;
                subLabel = await _getSubLabel(treeValue, visitedLibraries, ctx);
            } else if (subLabelAttributeProps.format === AttributeFormats.DATE_RANGE) {
                subLabel = value ? _convertDateRangeToString(value, ctx) : null;
            } else {
                subLabel = value;
            }
        }
        return subLabel;
    };

    const _convertDateRangeToString = (dateRange: {from: string; to: string}, {lang}: IQueryInfos): string =>
        translator.t('labels.date_range', {
            from: dateRange.from,
            to: dateRange.to,
            lng: lang,
            interpolation: {escapeValue: false},
        });

    const _getRecordIdentity = async (record: IRecord, ctx: IQueryInfos): Promise<IRecordIdentity> => {
        const lib = await getCoreEntityById<ILibrary>('library', record.library, ctx);

        if (!lib) {
            throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
        }

        const conf = lib.recordIdentityConf || {};
        const valuesOptions: IValuesOptions = {
            version: ctx.version ?? null,
        };

        const getLabel = conf.label ? () => _getLabel(record, [], ctx) : null;

        const getSubLabel = conf.subLabel ? () => _getSubLabel(record, [], ctx) : null;

        // look in tree if not defined on current record for color and preview
        let _getAncestorsPromise: Promise<TreePath | null> | null = null;
        const _getAncestors = async (): Promise<TreePath | null> => {
            if (_getAncestorsPromise !== null) {
                return _getAncestorsPromise;
            }
            _getAncestorsPromise = (async () => {
                const treeValues = await valueDomain.getValues({
                    library: lib.id,
                    recordId: record.id,
                    attribute: conf.treeColorPreview,
                    options: valuesOptions,
                    ctx,
                });

                if (treeValues.length) {
                    // for now, we look through first element (discard others if linked to multiple leaves of tree)
                    const treeAttrProps = await attributeDomain.getAttributeProperties({
                        id: conf.treeColorPreview,
                        ctx,
                    });
                    return elementAncestorsHelper.getCachedElementAncestors({
                        treeId: treeAttrProps.linked_tree,
                        nodeId: treeValues[0].payload.id,
                        ctx,
                    });
                }
                return null;
            })().catch(() => null);
            return _getAncestorsPromise;
        };

        const getColor = async () => {
            const color = conf.color ? await _getColor(record, [], ctx) : null;
            if (color === null && conf.treeColorPreview) {
                const ancestors = await _getAncestors();

                return ancestors?.reduceRight(async (resProm: Promise<string | null>, ancestor) => {
                    const res = await resProm; // cause async function so res is a promise
                    if (res !== null) {
                        // already found data, nothing to do
                        return res;
                    }
                    const ancestorIdentity = await _getRecordIdentity(ancestor.record, ctx);

                    return ancestorIdentity.getColor?.();
                }, null);
            }

            return color;
        };

        const getPreview = async () => {
            const preview =
                conf.preview || lib.behavior === LibraryBehavior.FILES
                    ? await _getPreviews({conf, lib, record, ctx})
                    : null;
            if (preview === null && conf.treeColorPreview) {
                const ancestors = await _getAncestors();

                const inheritedPreview = await ancestors?.reduceRight(
                    async (resProm: Promise<IPreview | null>, ancestor) => {
                        const res = await resProm; // cause async function so res is a promise
                        if (res !== null) {
                            // already found data, nothing to do
                            return res;
                        }
                        const ancestorIdentity = await _getRecordIdentity(ancestor.record, ctx);

                        return ancestorIdentity.getPreview?.();
                    },
                    null,
                );

                // If no preview found, or preview is not available, use library icon if any
                if (!inheritedPreview?.file) {
                    return _getLibraryIconPreview(lib, ctx);
                }
                return inheritedPreview;
            }
            return preview;
        };

        return {
            id: record.id,
            library: lib,
            getLabel,
            getSubLabel,
            getColor,
            getPreview,
        };
    };

    const ret: IRecordDomain = {
        find: findRecordsHelper,
        createEmptyRecord({library, ctx}) {
            return createRecordHelper({
                library,
                ctx,
                active: false,
            });
        },
        async activateNewRecord({library, recordId, formId, skipVerifyRequiredAttributes, ctx}) {
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
                            attributeId: attr.id ?? '',
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
                    const valuesErrors = missingAttributes.map(
                        (attribute): ICreateRecordValueError => ({
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
                        }),
                    );
                    return {
                        record: null,
                        valuesErrors,
                    };
                }
            }

            await valueDomain.saveValue({
                library,
                recordId,
                attribute: ATTRIBUTE_ACTIVE,
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
        async createRecord({library, values, verifyRequiredAttributes, ctx}): Promise<ICreateRecordResult> {
            let createdRecord: IRecord;
            try {
                createdRecord = await this.createEmptyRecord({library, ctx});

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
                        logger.verbose(`Unable to purge record ${createdRecord.id} in createRecord: ${err.message}`);
                    });

                    return {
                        record: null,
                        valuesErrors,
                    };
                }
                return {record: createdRecord, valuesErrors: null};
            } catch (error) {
                logger.error(`Error in createRecord: ${error.stack}`);
                if (createdRecord.id) {
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
        getRecordIdentity: _getRecordIdentity,
        getRecordFieldValue: valueDomain.getRecordFieldValue,
        async deactivateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord> {
            const savedValues = await valueDomain.saveValue({
                library: record.library,
                recordId: record.id,
                attribute: ATTRIBUTE_ACTIVE,
                value: {payload: false},
                ctx,
            });

            return {...record, active: savedValues[0].payload};
        },
        async activateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord> {
            const savedValues = await valueDomain.saveValue({
                library: record.library,
                recordId: record.id,
                attribute: ATTRIBUTE_ACTIVE,
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
        async deactivateRecordsBatch({libraryId, recordsIds, filters, ctx}) {
            let recordsToDeactivate: string[] = recordsIds ?? [];

            if (filters) {
                const records = await findRecordsHelper({
                    params: {
                        library: libraryId,
                        filters,
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
                    filters: [{field: ATTRIBUTE_ACTIVE, condition: AttributeCondition.EQUAL, value: 'false'}],
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
         * @returns {Promise<ICreateRecordResult[]>} An array of results for each duplicated record, including errors if any.
         *
         * Edge cases:
         * - If no attributes are provided in `duplicateRules`, new records will be created without duplicated values.
         * - If an attribute has no value in the source record and no overrideValue, it will not be duplicated for that record.
         * - If a recordId does not exist, it will be skipped.
         */
        async duplicateRecords({libraryId, recordIds, duplicateRules, ctx}): Promise<ICreateRecordResult[]> {
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
                        valuesErrorsByRecordId.get(recordId).push(...value[0].payload?.valuesErrors);
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
                                valuesErrors: valuesErrorsByRecordId.get(recordId),
                            };
                        }
                        return this.createRecord({
                            library: libraryId,
                            values,
                            verifyRequiredAttributes: true,
                            ctx,
                        });
                    }),
                );

                return duplicatedRecords;
            } catch (error) {
                logger.error(`Error in duplicateRecords: ${error.stack}`);
                return recordIds.map(() => ({
                    record: null,
                    valuesErrors: [
                        {
                            type: error?.type ?? ErrorTypes.INTERNAL_ERROR,
                            attribute: error?.attribute ?? null,
                            message: error && typeof error.message === 'string' ? error.message : String(error),
                        },
                    ],
                }));
            }
        },
    };

    return ret;
}
