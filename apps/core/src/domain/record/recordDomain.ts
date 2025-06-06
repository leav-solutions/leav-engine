// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction, localizedTranslation} from '@leav/utils';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {GetCoreEntityByIdFunc} from 'domain/helpers/getCoreEntityById';
import {IValidateHelper} from 'domain/helpers/validate';
import {ILibraryPermissionDomain} from 'domain/permission/libraryPermissionDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import type {i18n} from 'i18next';
import {IAttributeWithRevLink} from 'infra/attributeTypes/attributeTypesRepo';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import moment from 'moment';
import {join} from 'path';
import {IUtils} from 'utils/utils';
import * as Config from '_types/config';
import {IListWithCursor} from '_types/list';
import {IPreview} from '_types/preview';
import {IStandardValue, ITreeValue, IValue, IValuesOptions} from '_types/value';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ECacheType, ICachesService} from '../../infra/cache/cacheService';
import {getValuesToDisplay} from '../../utils/helpers/getValuesToDisplay';
import {getPreviewUrl} from '../../utils/preview/preview';
import {TypeGuards} from '../../utils/typeGuards';
import {ActionsListEvents} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute, IAttributeFilterOptions} from '../../_types/attribute';
import {Errors, ErrorTypes} from '../../_types/errors';
import {ILibrary, LibraryBehavior} from '../../_types/library';
import {
    AttributePermissionsActions,
    LibraryPermissionsActions,
    RecordAttributePermissionsActions,
    RecordPermissionsActions
} from '../../_types/permissions';
import {IQueryInfos} from '../../_types/queryInfos';
import {
    AttributeCondition,
    IRecord,
    IRecordFilterLight,
    IRecordFilterOption,
    IRecordIdentity,
    IRecordIdentityConf,
    IRecordSort,
    Operator,
    TreeCondition
} from '../../_types/record';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import getAttributesFromField from './helpers/getAttributesFromField';
import {isRecordWithId, SendRecordUpdateEventHelper} from './helpers/sendRecordUpdateEvent';
import {ICreateRecordResult, ICreateRecordValueError, IFindRecordParams} from './_types';
import {IFormRepo} from 'infra/form/formRepo';
import {IRecordAttributePermissionDomain} from '../permission/recordAttributePermissionDomain';
import validateValue from '../value/helpers/validateValue';
import {IAttributePermissionDomain} from '../permission/attributePermissionDomain';
import getAccessPermissionFilters from './helpers/getAccessPermissionFilters';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IDefaultPermissionHelper} from 'domain/permission/helpers/defaultPermission';

/**
 * Simple list of filters (fieldName: filterValue) to apply to get records.
 */
const allowedTypeOperator = {
    string: [
        AttributeCondition.EQUAL,
        AttributeCondition.NOT_EQUAL,
        AttributeCondition.BEGIN_WITH,
        AttributeCondition.END_WITH,
        AttributeCondition.CONTAINS,
        AttributeCondition.NOT_CONTAINS,
        AttributeCondition.START_ON,
        AttributeCondition.START_BEFORE,
        AttributeCondition.START_AFTER,
        AttributeCondition.END_ON,
        AttributeCondition.END_BEFORE,
        AttributeCondition.END_AFTER,
        TreeCondition.CLASSIFIED_IN,
        TreeCondition.NOT_CLASSIFIED_IN
    ],
    number: [
        AttributeCondition.EQUAL,
        AttributeCondition.NOT_EQUAL,
        AttributeCondition.GREATER_THAN,
        AttributeCondition.LESS_THAN,
        AttributeCondition.START_ON,
        AttributeCondition.START_BEFORE,
        AttributeCondition.START_AFTER,
        AttributeCondition.END_ON,
        AttributeCondition.END_BEFORE,
        AttributeCondition.END_AFTER,
        AttributeCondition.VALUES_COUNT_EQUAL,
        AttributeCondition.VALUES_COUNT_GREATER_THAN,
        AttributeCondition.VALUES_COUNT_LOWER_THAN
    ],
    boolean: [AttributeCondition.EQUAL, AttributeCondition.NOT_EQUAL],
    null: [
        AttributeCondition.EQUAL,
        AttributeCondition.NOT_EQUAL,
        AttributeCondition.IS_EMPTY,
        AttributeCondition.IS_NOT_EMPTY,
        AttributeCondition.TODAY,
        AttributeCondition.YESTERDAY,
        AttributeCondition.TOMORROW,
        AttributeCondition.LAST_MONTH,
        AttributeCondition.NEXT_MONTH
    ],
    object: [AttributeCondition.BETWEEN]
};

export interface IRecordDomain {
    createRecord(params: {
        library: string;
        values?: IValue[];
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
        ctx
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
     * Get the value of targeted attribute with actions applied on it including metadata.
     *
     * Avoid requesting DB if attribute already found in `record` param.
     *
     * @param {Object} params
     * @param params.library
     * @param params.record Could be emulated with only `{ id: <real_id> }`
     * @param params.attributeId
     * @param params.options
     * @param params.ctx
     */
    getRecordFieldValue({
        library,
        record,
        attributeId,
        options,
        ctx
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
}

export interface IRecordDomainDeps {
    config: Config.IConfig;
    'core.infra.record': IRecordRepo;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.value': IValueDomain;
    'core.domain.permission.record': IRecordPermissionDomain;
    'core.domain.permission.library': ILibraryPermissionDomain;
    'core.domain.permission.attribute': IAttributePermissionDomain;
    'core.domain.permission.recordAttribute': IRecordAttributePermissionDomain;
    'core.domain.permission.helpers.defaultPermission': IDefaultPermissionHelper;
    'core.domain.helpers.getCoreEntityById': GetCoreEntityByIdFunc;
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.record.helpers.sendRecordUpdateEvent': SendRecordUpdateEventHelper;
    'core.infra.library': ILibraryRepo;
    'core.infra.tree': ITreeRepo;
    'core.infra.value': IValueRepo;
    'core.infra.form': IFormRepo;
    'core.infra.permission': IPermissionRepo;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.infra.cache.cacheService': ICachesService;
    'core.utils': IUtils;
    translator: i18n;
}

export default function ({
    config,
    'core.infra.record': recordRepo,
    'core.domain.attribute': attributeDomain,
    'core.domain.value': valueDomain,
    'core.domain.permission.record': recordPermissionDomain,
    'core.domain.permission.library': libraryPermissionDomain,
    'core.domain.permission.attribute': attrPermissionDomain,
    'core.domain.permission.recordAttribute': recordAttributePermissionDomain,
    'core.domain.permission.helpers.defaultPermission': defaultPermHelper,
    'core.domain.helpers.getCoreEntityById': getCoreEntityById,
    'core.domain.helpers.validate': validateHelper,
    'core.domain.record.helpers.sendRecordUpdateEvent': sendRecordUpdateEvent,
    'core.infra.library': libraryRepo,
    'core.infra.tree': treeRepo,
    'core.infra.value': valueRepo,
    'core.infra.form': formRepo,
    'core.infra.permission': permissionRepo,
    'core.domain.eventsManager': eventsManager,
    'core.infra.cache.cacheService': cacheService,
    'core.utils': utils,
    translator
}: IRecordDomainDeps): IRecordDomain {
    /**
     * Extract value from record if it's available (attribute simple), or fetch it from DB
     *
     * @param record
     * @param attribute
     * @param library
     * @param options
     * @param ctx
     */
    const _extractRecordValue = async (
        record: IRecord,
        attribute: IAttribute,
        library: string,
        options: IValuesOptions,
        ctx: IQueryInfos
    ): Promise<IValue[]> => {
        let values: IValue[];

        if (attribute.id && typeof record[attribute.id] !== 'undefined') {
            // Format attribute field into simple value
            values = [
                {
                    payload:
                        attribute.type === AttributeTypes.SIMPLE_LINK && typeof record[attribute.id] === 'string'
                            ? {id: record[attribute.id]}
                            : record[attribute.id]
                }
            ];

            // Apply actionsList
            values = await valueDomain.runActionsList({
                listName: ActionsListEvents.GET_VALUE,
                values,
                attribute,
                record,
                library,
                ctx
            });
        } else {
            values = await valueDomain.getValues({
                library,
                recordId: record.id,
                attribute: attribute.id,
                options,
                ctx
            });
        }

        return values;
    };

    const _checkLogicExpr = async (filters: IRecordFilterLight[], ctx: IQueryInfos) => {
        const stack = [];
        const output = [];

        // convert to Reverse Polish Notation
        for (const f of filters) {
            await _validationFilter(f, ctx);

            if (!_isOperatorFilter(f)) {
                output.push(f);
            } else if (f.operator !== Operator.CLOSE_BRACKET) {
                stack.push(f);
            } else {
                let e: IRecordFilterOption = stack.pop();

                while (e && e.operator !== Operator.OPEN_BRACKET) {
                    output.push(e);
                    e = stack.pop();
                }

                if (!e) {
                    throw new ValidationError({id: Errors.INVALID_FILTERS_EXPRESSION});
                }
            }
        }

        const rpn = output.concat(stack.reverse());

        // validation filters logical expression (order)
        let stackSize = 0;

        for (const e of rpn) {
            stackSize += !_isOperatorFilter(e) ? 1 : -1;

            if (stackSize <= 0) {
                throw new ValidationError({id: Errors.INVALID_FILTERS_EXPRESSION});
            }
        }

        if (stackSize !== 1) {
            throw new ValidationError({id: Errors.INVALID_FILTERS_EXPRESSION});
        }
    };

    const _getSimpleLinkedRecords = async (
        library: string,
        value: string,
        ctx: IQueryInfos
    ): Promise<Array<{attribute: string; records: IRecord[]}>> => {
        const filters: IAttributeFilterOptions = {type: [AttributeTypes.SIMPLE_LINK], linked_library: library};
        // get all attributes linked to the library param
        const attributes = await attributeDomain.getAttributes({
            params: {
                filters
            },
            ctx
        });

        const linkedValuesToDel: Array<{records: IRecord[]; attribute: string}> = [];
        const libraryAttributes: {[library: string]: IAttribute[]} = {};

        // Get libraries using link attributes
        for (const attr of attributes.list) {
            const libs = await libraryRepo.getLibrariesUsingAttribute(attr.id, ctx);
            for (const l of libs) {
                libraryAttributes[l] = !!libraryAttributes[l] ? [...libraryAttributes[l], attr] : [attr];
            }
        }

        for (const [lib, attrs] of Object.entries(libraryAttributes)) {
            for (const attr of attrs) {
                let reverseLink: IAttribute;
                if (!!attr.reverse_link) {
                    reverseLink = await attributeDomain.getAttributeProperties({
                        id: attr.reverse_link as string,
                        ctx
                    });
                }

                const records = await recordRepo.find({
                    libraryId: lib,
                    filters: [
                        {attributes: [{...attr, reverse_link: reverseLink}], condition: AttributeCondition.EQUAL, value}
                    ],
                    ctx
                });

                if (records.list.length) {
                    linkedValuesToDel.push({records: records.list, attribute: attr.id});
                }
            }
        }

        return linkedValuesToDel;
    };

    const _isRelativeDateCondition = (condition: AttributeCondition): boolean =>
        condition === AttributeCondition.TODAY ||
        condition === AttributeCondition.TOMORROW ||
        condition === AttributeCondition.YESTERDAY ||
        condition === AttributeCondition.NEXT_MONTH ||
        condition === AttributeCondition.LAST_MONTH;

    const _isNumericCondition = (condition: AttributeCondition): boolean =>
        condition === AttributeCondition.VALUES_COUNT_EQUAL ||
        condition === AttributeCondition.VALUES_COUNT_GREATER_THAN ||
        condition === AttributeCondition.VALUES_COUNT_LOWER_THAN;

    const _isAttributeFilter = (filter: IRecordFilterLight): boolean =>
        filter.condition in AttributeCondition &&
        typeof filter.field !== 'undefined' &&
        (typeof filter.value !== 'undefined' ||
            filter.condition === AttributeCondition.IS_EMPTY ||
            filter.condition === AttributeCondition.IS_NOT_EMPTY ||
            _isRelativeDateCondition(filter.condition as AttributeCondition));

    const _isClassifiedFilter = (filter: IRecordFilterLight): boolean =>
        filter.condition in TreeCondition && typeof filter.treeId !== 'undefined';

    const _isOperatorFilter = (filter: IRecordFilterLight): boolean => filter.operator in Operator;

    const _validationFilter = async (filter: IRecordFilterLight, ctx: IQueryInfos): Promise<void> => {
        if (typeof filter.condition === 'undefined' && typeof filter.operator === 'undefined') {
            throw utils.generateExplicitValidationError('filters', Errors.INVALID_FILTER_FORMAT, ctx.lang);
        }

        if (filter.condition in AttributeCondition && !_isAttributeFilter(filter)) {
            throw utils.generateExplicitValidationError('filters', Errors.INVALID_ATTRIBUTE_FILTER_FORMAT, ctx.lang);
        }

        if (filter.condition in TreeCondition && !_isClassifiedFilter(filter)) {
            throw utils.generateExplicitValidationError('filters', Errors.INVALID_TREE_FILTER_FORMAT, ctx.lang);
        }
    };

    const _getPreviews = async ({
        conf,
        lib,
        record,
        visitedLibraries = [],
        ctx
    }: {
        conf: IRecordIdentityConf;
        lib: ILibrary;
        record: IRecord;
        visitedLibraries?: string[];
        ctx: IQueryInfos;
    }) => {
        const previewBaseUrl = getPreviewUrl();
        visitedLibraries.push(lib.id);

        let previewRecord: IRecord;

        // On a file, previews are accessible straight on the record
        // Otherwise, we fetch values of the previews attribute
        let previewsAttributeId;
        let fileLibraryId;
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
                ctx
            });

            previewValues = getValuesToDisplay(previewValues);

            if (!(previewValues as IValue[]).length) {
                return null;
            }

            let previewAttributeLibraryProps: ILibrary;
            try {
                previewAttributeLibraryProps = await validateHelper.validateLibrary(
                    previewAttributeProps.linked_library,
                    ctx
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
                          ctx
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
            ctx
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
                const absoluteUrl = join(previewBaseUrl, url.toString());

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

            const libraryIconRecord = await ret.find({
                params: {
                    library: libraryIcon.libraryId,
                    filters: [{condition: AttributeCondition.EQUAL, field: 'id', value: libraryIcon.recordId}]
                },
                ctx
            });

            if (!libraryIconRecord?.list?.length) {
                return null;
            }

            const libraryIconLib = await getCoreEntityById<ILibrary>('library', libraryIcon.libraryId, ctx);
            return _getPreviews({
                conf: libraryIconLib.recordIdentityConf,
                lib: libraryIconLib,
                record: libraryIconRecord.list[0],
                ctx
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
            version: ctx.version ?? null
        };

        let label: string = null;
        if (conf.label) {
            const labelAttributeProps = await attributeDomain.getAttributeProperties({id: conf.label, ctx});

            let labelValues = await valueDomain.getValues({
                library: lib.id,
                recordId: record.id,
                attribute: conf.label,
                options: valuesOptions,
                ctx
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
        ctx: IQueryInfos
    ): Promise<string | null> => {
        if (!record) {
            return null;
        }
        visitedLibraries.push(record.library);

        const lib = await validateHelper.validateLibrary(record.library, ctx);

        const conf = lib.recordIdentityConf || {};
        const valuesOptions: IValuesOptions = {
            version: ctx.version ?? null
        };

        let color: string | null = null;
        if (conf.color) {
            const colorAttributeProps = await attributeDomain.getAttributeProperties({id: conf.color, ctx});

            let colorValues = await valueDomain.getValues({
                library: lib.id,
                recordId: record.id,
                attribute: conf.color,
                options: valuesOptions,
                ctx
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
        ctx: IQueryInfos
    ): Promise<string | null> => {
        if (!record) {
            return null;
        }
        visitedLibraries.push(record.library);

        const lib = await validateHelper.validateLibrary(record.library, ctx);

        const conf = lib.recordIdentityConf || {};
        const valuesOptions: IValuesOptions = {
            version: ctx.version ?? null
        };
        let subLabel: string | null = null;
        if (conf.subLabel) {
            const subLabelAttributeProps = await attributeDomain.getAttributeProperties({id: conf.subLabel, ctx});

            let subLabelValues = await valueDomain.getValues({
                library: lib.id,
                recordId: record.id,
                attribute: conf.subLabel,
                options: valuesOptions,
                ctx
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
            interpolation: {escapeValue: false}
        });

    const _getRecordIdentity = async (record: IRecord, ctx: IQueryInfos): Promise<IRecordIdentity> => {
        const lib = await getCoreEntityById<ILibrary>('library', record.library, ctx);

        if (!lib) {
            throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
        }

        const conf = lib.recordIdentityConf || {};
        const valuesOptions: IValuesOptions = {
            version: ctx.version ?? null
        };

        let label: string | null = null;
        if (conf.label) {
            label = await _getLabel(record, [], ctx);
        }

        let subLabel: string | null = null;
        if (conf.subLabel) {
            subLabel = await _getSubLabel(record, [], ctx);
        }

        let color: string | null = null;
        if (conf.color) {
            color = await _getColor(record, [], ctx);
        }

        let preview: IPreview = null;
        if (conf.preview || lib.behavior === LibraryBehavior.FILES) {
            preview = (await _getPreviews({conf, lib, record, ctx})) ?? null;
        }

        //look in tree if not defined on current record
        if ((color === null || preview === null) && conf.treeColorPreview) {
            const treeValues = await valueDomain.getValues({
                library: lib.id,
                recordId: record.id,
                attribute: conf.treeColorPreview,
                options: valuesOptions,
                ctx
            });

            if (treeValues.length) {
                // for now, we look through first element (discard others if linked to multiple leaves of tree)
                const treeAttrProps = await attributeDomain.getAttributeProperties({id: conf.treeColorPreview, ctx});
                const ancestors = await treeRepo.getElementAncestors({
                    treeId: treeAttrProps.linked_tree,
                    nodeId: treeValues[0].payload.id,
                    ctx
                });

                const inheritedData = await ancestors.reduceRight(
                    async (resProm: Promise<{color: string; preview: IPreview}>, ancestor) => {
                        const res = await resProm; // cause async function so res is a promise
                        if (res.color !== null && res.preview !== null) {
                            // already found data, nothing to do
                            return res;
                        }
                        const ancestorIdentity = await _getRecordIdentity(ancestor.record, ctx);

                        return {
                            color: res.color === null ? ancestorIdentity.color : res.color,
                            preview: res.preview === null ? ancestorIdentity.preview : res.preview
                        };
                    },
                    Promise.resolve({color, preview})
                );
                color = color === null ? inheritedData.color : color;
                preview = preview === null ? inheritedData.preview : preview;
            }
        }

        // If no preview found, or preview is not available, use library icon if any
        if (preview === null || !preview.file) {
            preview = await _getLibraryIconPreview(lib, ctx);
        }

        const identity = {
            id: record.id,
            library: lib,
            label,
            subLabel,
            color,
            preview
        };

        return identity;
    };

    const ret: IRecordDomain = {
        async createRecord({library, values, ctx, verifyRequiredAttributes}) {
            const recordData = {
                created_at: moment().unix(),
                created_by: String(ctx.userId),
                modified_at: moment().unix(),
                modified_by: String(ctx.userId),
                active: true
            };

            const canCreate = await libraryPermissionDomain.getLibraryPermission({
                action: LibraryPermissionsActions.CREATE_RECORD,
                userId: ctx.userId,
                libraryId: library,
                ctx
            });

            if (!canCreate) {
                throw new PermissionError(LibraryPermissionsActions.CREATE_RECORD);
            }

            const valuesByAttribute = (values ??= []).reduce<Record<string, IValue[]>>((acc, value) => {
                if (!acc[value.attribute]) {
                    acc[value.attribute] = [];
                }
                acc[value.attribute].push(value);
                return acc;
            }, {});

            if (verifyRequiredAttributes) {
                const creationForm = (
                    await formRepo.getForms({
                        params: {filters: {id: 'creation', library}, strictFilters: true, withCount: false},
                        ctx
                    })
                ).list[0];

                const requiredAttributes = (
                    creationForm
                        ? await attributeDomain.getFormAttributes(library, 'creation', ctx)
                        : await attributeDomain.getLibraryAttributes(library, ctx)
                ).filter(attribute => attribute.required);

                const missingAttributes = requiredAttributes.filter(
                    attribute => !Object.keys(valuesByAttribute).includes(attribute.id)
                );

                const attributeLabel = label =>
                    typeof label === 'string' ? label : localizedTranslation(label, [ctx.lang]);

                if (missingAttributes.length) {
                    return {
                        record: null,
                        valuesErrors: missingAttributes.map(
                            (attribute): ICreateRecordValueError => ({
                                type: Errors.REQUIRED_ATTRIBUTE,
                                attribute: attribute.id,
                                message: utils.translateError(
                                    {
                                        msg: Errors.REQUIRED_ATTRIBUTE,
                                        vars: {attribute: attributeLabel(attribute.label)}
                                    },
                                    ctx.lang
                                )
                            })
                        )
                    };
                }
            }

            if (Object.keys(valuesByAttribute).length) {
                // First, check if values are ok. If not, we won't create the record at all
                const res = await Promise.allSettled(
                    Object.entries(valuesByAttribute).map(async ([attributeId, attributeValues]) => {
                        const canEditAttr = await attrPermissionDomain.getAttributePermission({
                            action: AttributePermissionsActions.EDIT_VALUE,
                            attributeId,
                            ctx
                        });

                        if (!canEditAttr) {
                            throw new PermissionError<IValue>(AttributePermissionsActions.EDIT_VALUE, {
                                attribute: attributeId,
                                [attributeId]: 'Permission denied'
                            });
                        }

                        const attributeProps = await attributeDomain.getAttributeProperties({
                            id: attributeId,
                            ctx
                        });

                        const valueChecksParams = {
                            attributeProps,
                            library,
                            keepEmpty: false,
                            infos: ctx
                        };

                        const [validationErrors] = await Promise.all(
                            attributeValues.map(value =>
                                validateValue({
                                    ...valueChecksParams,
                                    value,
                                    deps: {
                                        attributeDomain,
                                        recordRepo,
                                        valueRepo,
                                        treeRepo
                                    },
                                    ctx
                                })
                            )
                        );

                        if (Object.keys(validationErrors).length > 0) {
                            throw new ValidationError<IValue>(validationErrors, 'Validation error', false, {
                                attribute: attributeProps.id,
                                values: attributeValues
                            });
                        }

                        return valueDomain.runActionsList({
                            listName: ActionsListEvents.SAVE_VALUE,
                            values: attributeValues,
                            attribute: attributeProps,
                            library,
                            ctx
                        });
                    })
                );

                const errors = res
                    .filter(r => r.status === 'rejected')
                    .map((rejection: PromiseRejectedResult): ICreateRecordValueError => {
                        const errorAttribute =
                            rejection.reason.fields?.attribute ||
                            // coming from attributeDomain.getAttributeProperties
                            rejection.reason.fields?.id?.vars?.attribute;
                        const errorReason =
                            rejection.reason.fields?.[errorAttribute] ||
                            // coming from attributeDomain.getAttributeProperties
                            rejection.reason.fields?.id;

                        return {
                            type: rejection.reason.type,
                            attribute: errorAttribute,
                            input: rejection.reason.context?.values[0].payload,
                            message: utils.translateError(errorReason, ctx.lang)
                        };
                    });

                if (errors.length > 0) {
                    return {record: null, valuesErrors: errors};
                }
            }

            const newRecord = await recordRepo.createRecord({libraryId: library, recordData, ctx});

            let valuesErrors = null;
            if (values?.length) {
                // Make sure we don't have any id_value hanging on as we're on creation here
                const cleanValues = values.map(v => ({...v, id_value: null}));

                const {errors} = await valueDomain.saveValueBatch({
                    library,
                    recordId: newRecord.id,
                    values: cleanValues,
                    skipPermission: true,
                    ctx
                });
                valuesErrors = errors;
            }

            // await is necessary during importData(), otherwise it will generate a memory leak due to number of events incoming
            await eventsManager.sendDatabaseEvent(
                {
                    action: EventAction.RECORD_SAVE,
                    topic: {
                        record: {
                            id: newRecord.id,
                            libraryId: newRecord.library
                        }
                    },
                    after: newRecord
                },
                ctx
            );

            return {record: newRecord, valuesErrors};
        },
        async updateRecord({library, recordData, ctx}): Promise<IRecord> {
            const {old: oldRecord, new: savedRecord} = await recordRepo.updateRecord({
                libraryId: library,
                recordData,
                ctx
            });

            await eventsManager.sendDatabaseEvent(
                {
                    action: EventAction.RECORD_SAVE,
                    topic: {
                        record: {
                            id: savedRecord.id,
                            libraryId: savedRecord.library
                        }
                    },
                    before: oldRecord,
                    after: recordData
                },
                ctx
            );

            if (isRecordWithId(recordData)) {
                sendRecordUpdateEvent({...recordData, library}, [], ctx);
                const cacheKey = utils.getRecordsCacheKey(library, recordData.id);
                await cacheService.getCache(ECacheType.RAM).deleteData([cacheKey]);
            }

            return savedRecord;
        },
        async deleteRecord({library, id, ctx}): Promise<IRecord> {
            await validateHelper.validateLibrary(library, ctx);

            // Check permission
            const canDelete = await recordPermissionDomain.getRecordPermission({
                action: RecordPermissionsActions.DELETE_RECORD,
                userId: ctx.userId,
                library,
                recordId: id,
                ctx
            });

            if (!canDelete) {
                throw new PermissionError(RecordPermissionsActions.DELETE_RECORD);
            }

            const simpleLinkedRecords = await _getSimpleLinkedRecords(library, id, ctx);

            // delete simple linked values
            for (const e of simpleLinkedRecords) {
                for (const r of e.records) {
                    await valueDomain.deleteValue({
                        library: r.library,
                        recordId: r.id,
                        attribute: e.attribute,
                        ctx
                    });
                }
            }

            // Delete linked values (advanced, advanced link and tree)
            await valueRepo.deleteAllValuesByRecord({libraryId: library, recordId: id, ctx});

            // Remove element from all trees
            const libraryTrees = await treeRepo.getTrees({
                params: {
                    filters: {
                        library
                    }
                },
                ctx
            });

            // For each tree, get all record nodes
            await Promise.all(
                libraryTrees.list.map(async tree => {
                    const nodes = await treeRepo.getNodesByRecord({
                        treeId: tree.id,
                        record: {
                            id,
                            library
                        },
                        ctx
                    });

                    for (const node of nodes) {
                        await treeRepo.deleteElement({
                            treeId: tree.id,
                            nodeId: node,
                            deleteChildren: true,
                            ctx
                        });
                    }
                })
            );

            // Everything is clean, we can actually delete the record
            const deletedRecord = await recordRepo.deleteRecord({libraryId: library, recordId: id, ctx});

            await eventsManager.sendDatabaseEvent(
                {
                    action: EventAction.RECORD_DELETE,
                    topic: {
                        record: {
                            libraryId: deletedRecord.library,
                            id: deletedRecord.id
                        }
                    },
                    before: deletedRecord
                },
                ctx
            );

            return deletedRecord;
        },
        async find({params, ctx}) {
            const {library, sort, pagination, withCount, retrieveInactive = false} = params;
            const {filters = [] as IRecordFilterLight[], fulltextSearch} = params;
            const fullFilters: IRecordFilterOption[] = [];
            let fullSort: IRecordSort[] = [];

            await validateHelper.validateLibrary(library, ctx);

            const isLibraryAccessible = await libraryPermissionDomain.getLibraryPermission({
                libraryId: params.library,
                userId: ctx.userId,
                action: LibraryPermissionsActions.ACCESS_LIBRARY,
                ctx
            });

            if (!isLibraryAccessible) {
                throw new PermissionError(LibraryPermissionsActions.ACCESS_LIBRARY);
            }

            if (filters.length) {
                await _checkLogicExpr(filters, ctx);
            }

            // Hydrate filters with attribute properties and cast filters values if needed
            for (const f of filters) {
                let filter: IRecordFilterOption = {};

                if (_isAttributeFilter(f)) {
                    const attributes = await getAttributesFromField({
                        field: f.field,
                        condition: f.condition,
                        deps: {
                            'core.domain.attribute': attributeDomain,
                            'core.infra.library': libraryRepo,
                            'core.infra.tree': treeRepo
                        },
                        ctx
                    });

                    // Set reverse links if necessary.
                    const attrsRepo = (await Promise.all(
                        attributes.map(async a =>
                            !!a.reverse_link
                                ? {
                                      ...a,
                                      reverse_link: await attributeDomain.getAttributeProperties({
                                          id: a.reverse_link as string,
                                          ctx
                                      })
                                  }
                                : a
                        )
                    )) as IAttributeWithRevLink[];

                    let value: any = f.value ?? null;
                    const lastAttr: IAttribute = attrsRepo[attrsRepo.length - 1];

                    if (value !== null) {
                        if (
                            lastAttr.format === AttributeFormats.NUMERIC ||
                            (lastAttr.format === AttributeFormats.DATE &&
                                f.condition !== AttributeCondition.BETWEEN &&
                                !_isRelativeDateCondition(filter.condition as AttributeCondition)) ||
                            _isNumericCondition(f.condition as AttributeCondition)
                        ) {
                            value = Number(f.value);
                        } else if (lastAttr.format === AttributeFormats.BOOLEAN) {
                            value = f.value === 'true';
                        } else if (
                            lastAttr.format === AttributeFormats.DATE &&
                            f.condition === AttributeCondition.BETWEEN
                        ) {
                            value = JSON.parse(f.value);

                            if (typeof value.from === 'undefined' || typeof value.to === 'undefined') {
                                throw new ValidationError({condition: Errors.INVALID_FILTER_CONDITION_VALUE});
                            }
                        }
                    }

                    const valueType = value === null ? 'null' : typeof value;
                    if (
                        (f.condition && !allowedTypeOperator[valueType].includes(f.condition)) ||
                        (f.condition === AttributeCondition.BETWEEN &&
                            (typeof value.from === 'undefined' || typeof value.to === 'undefined'))
                    ) {
                        throw new ValidationError({condition: Errors.INVALID_FILTER_CONDITION_VALUE});
                    }

                    filter = {attributes: attrsRepo, value, condition: f.condition};
                } else {
                    filter = f;
                }

                fullFilters.push(filter);
            }

            // Check sort fields
            if (sort?.length) {
                fullSort = await Promise.all(
                    sort.filter(Boolean).map(async s => {
                        const sortAttributes = await getAttributesFromField({
                            field: s.field,
                            condition: null,
                            deps: {
                                'core.domain.attribute': attributeDomain,
                                'core.infra.library': libraryRepo,
                                'core.infra.tree': treeRepo
                            },
                            ctx
                        });

                        const sortAttributesRepo = (await Promise.all(
                            sortAttributes.map(async a =>
                                !!a.reverse_link
                                    ? {
                                          ...a,
                                          reverse_link: await attributeDomain.getAttributeProperties({
                                              id: a.reverse_link as string,
                                              ctx
                                          })
                                      }
                                    : a
                            )
                        )) as IAttributeWithRevLink[];

                        return {
                            attributes: sortAttributesRepo,
                            order: s.order
                        };
                    }, [])
                );
            }

            const accessPermissionFilters = await getAccessPermissionFilters(
                ctx.groupsId,
                library,
                {
                    'core.domain.helpers.getCoreEntityById': getCoreEntityById,
                    'core.infra.tree': treeRepo,
                    'core.infra.permission': permissionRepo,
                    'core.domain.permission.helpers.defaultPermission': defaultPermHelper
                },
                ctx
            );

            return recordRepo.find({
                libraryId: library,
                filters: fullFilters,
                sort: fullSort,
                pagination,
                withCount,
                retrieveInactive,
                fulltextSearch,
                accessPermissionFilters,
                ctx
            });
        },
        getRecordIdentity: _getRecordIdentity,
        async getRecordFieldValue({library, record, attributeId, options, ctx}) {
            const libraryAttributes = await attributeDomain.getLibraryAttributes(library, ctx);
            if (!libraryAttributes.map(a => a.id).includes(attributeId)) {
                throw new ValidationError({
                    [attributeId]: {msg: Errors.INVALID_ATTRIBUTE_FOR_LIBRARY, vars: {attribute: attributeId, library}}
                });
            }

            const perm = await recordAttributePermissionDomain.getRecordAttributePermission(
                RecordAttributePermissionsActions.ACCESS_ATTRIBUTE,
                ctx.userId,
                attributeId,
                library,
                record.id,
                ctx
            );

            if (!perm) {
                return [];
            }

            const attrProps = await attributeDomain.getAttributeProperties({id: attributeId, ctx});
            let values = await _extractRecordValue(record, attrProps, library, options, ctx);

            const hasNoValue = values.length === 0;
            if (hasNoValue) {
                values = [
                    {
                        payload: null
                    }
                ];
            }

            let formattedValues = await Promise.all(
                values.map(async v => {
                    const formattedValue = await valueDomain.formatValue({
                        attribute: attrProps,
                        value: v,
                        record,
                        library,
                        ctx
                    });

                    if (attrProps.metadata_fields && formattedValue.metadata) {
                        for (const metadataField of attrProps.metadata_fields) {
                            if (!formattedValue.metadata[metadataField]) {
                                continue;
                            }

                            const metadataAttributeProps = await attributeDomain.getAttributeProperties({
                                id: metadataField,
                                ctx
                            });

                            const computedMetadata = await valueDomain.runActionsList({
                                listName: ActionsListEvents.GET_VALUE,
                                attribute: metadataAttributeProps,
                                library,
                                values: [formattedValue.metadata[metadataField] as IStandardValue],
                                ctx
                            });

                            formattedValue.metadata[metadataField] = computedMetadata[0];
                        }
                    }

                    return formattedValue;
                })
            );

            // sort of flatMap cause _formatRecordValue can return multiple values for 1 input val (think heritage)
            formattedValues = formattedValues.reduce((acc, v) => {
                if (Array.isArray(v.payload)) {
                    acc = [
                        ...acc,
                        ...v.payload.map(vpart => ({
                            value: vpart,
                            attribute: v.attribute
                        }))
                    ];
                } else {
                    acc.push(v);
                }
                return acc;
            }, []);

            if (hasNoValue) {
                // remove null values or values that do not represent a record
                formattedValues = formattedValues.filter(
                    v =>
                        v.payload !== null &&
                        typeof v.payload !== 'undefined' &&
                        typeof v.payload === 'object' &&
                        v.payload.hasOwnProperty('id') &&
                        v.payload.hasOwnProperty('library')
                );
            }
            return formattedValues;
        },
        async deactivateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord> {
            const savedValues = await valueDomain.saveValue({
                library: record.library,
                recordId: record.id,
                attribute: 'active',
                value: {payload: false},
                ctx
            });

            return {...record, active: savedValues[0].payload};
        },
        async activateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord> {
            const savedValues = await valueDomain.saveValue({
                library: record.library,
                recordId: record.id,
                attribute: 'active',
                value: {payload: true},
                ctx
            });

            return {...record, active: savedValues[0].payload};
        },
        async activateRecordsBatch({libraryId, recordsIds, filters, ctx}) {
            let recordsToActivate: string[] = recordsIds ?? [];

            if (filters) {
                const records = await this.find({
                    params: {
                        library: libraryId,
                        filters,
                        options: {forceArray: true, forceGetAllValues: true},
                        retrieveInactive: true,
                        withCount: false
                    },
                    ctx
                });
                recordsToActivate = records.list.map(record => record.id);
            }

            recordsToActivate = await Promise.all(
                recordsToActivate.map(async recordId => {
                    const hasCreatePermission = await recordPermissionDomain.getRecordPermission({
                        action: RecordPermissionsActions.CREATE_RECORD,
                        userId: ctx.userId,
                        library: libraryId,
                        recordId,
                        ctx
                    });

                    return hasCreatePermission ? recordId : null;
                })
            );

            recordsToActivate = recordsToActivate.filter(recordId => recordId !== null);

            const activeRecords = await Promise.all(
                recordsToActivate.map(recordId => this.activateRecord({id: recordId, library: libraryId}, ctx))
            );

            return activeRecords;
        },
        async deactivateRecordsBatch({libraryId, recordsIds, filters, ctx}) {
            let recordsToDeactivate: string[] = recordsIds ?? [];

            if (filters) {
                const records = await this.find({
                    params: {
                        library: libraryId,
                        filters,
                        options: {forceArray: true, forceGetAllValues: true},
                        retrieveInactive: false,
                        withCount: false
                    },
                    ctx
                });
                recordsToDeactivate = records.list.map(record => record.id);
            }

            recordsToDeactivate = await Promise.all(
                recordsToDeactivate.map(async recordId => {
                    const hasDeletePermission = await recordPermissionDomain.getRecordPermission({
                        action: RecordPermissionsActions.DELETE_RECORD,
                        userId: ctx.userId,
                        library: libraryId,
                        recordId,
                        ctx
                    });
                    return hasDeletePermission ? recordId : null;
                })
            );
            recordsToDeactivate = recordsToDeactivate.filter(recordId => recordId !== null);

            const inactiveRecords = await Promise.all(
                recordsToDeactivate.map(recordId => this.deactivateRecord({id: recordId, library: libraryId}, ctx))
            );

            return inactiveRecords;
        },
        async purgeInactiveRecords({libraryId, ctx}): Promise<IRecord[]> {
            const inactiveRecords = await this.find({
                params: {
                    library: libraryId,
                    filters: [{field: 'active', condition: AttributeCondition.EQUAL, value: 'false'}]
                },
                ctx
            });

            const purgedRecords: IRecord[] = [];
            for (const record of inactiveRecords.list) {
                purgedRecords.push(
                    await this.deleteRecord({
                        library: libraryId,
                        id: record.id,
                        ctx
                    })
                );
            }

            return purgedRecords;
        }
    };

    return ret;
}
