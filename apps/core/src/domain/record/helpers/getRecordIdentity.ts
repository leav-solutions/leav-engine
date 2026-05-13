import {type i18n} from 'i18next';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IElementAncestorsHelper} from '../../tree/helpers/elementAncestors';
import {type GetCoreEntityByIdFunc} from '../../helpers/getCoreEntityById';
import {type IValidateHelper} from '../../helpers/validate';
import {type FindRecordsHelper} from './findRecords';
import {type ICachesService} from '../../../infra/cache/cacheService';
import {getValuesToDisplay} from '../../../utils/helpers/getValuesToDisplay';
import {TypeGuards} from '../../../utils';
import {AttributeFormats} from '../../../_types/attribute';
import {type ILibrary, LibraryBehavior} from '../../../_types/library';
import {type IPreview} from '../../../_types/preview';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {AttributeCondition, type IRecord, type IRecordIdentity, type IRecordIdentityConf} from '../../../_types/record';
import {type TreePath} from '../../../_types/tree';
import {type ITreeValue, type IValue, type IValuesOptions} from '../../../_types/value';
import {type IUtils} from '../../../utils/utils';
import type * as Config from '../../../_types/config';
import {type GetRecordFieldValueHelper} from '../../value/helpers/getRecordFieldValue';

export type GetRecordIdentityHelper = (record: IRecord, ctx: IQueryInfos) => Promise<IRecordIdentity>;

interface IDeps {
    config: Config.IConfig;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.value.helpers.getRecordFieldValue': GetRecordFieldValueHelper;
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.helpers.getCoreEntityById': GetCoreEntityByIdFunc;
    'core.domain.tree.helpers.elementAncestors': IElementAncestorsHelper;
    'core.domain.record.helpers.findRecords': FindRecordsHelper;
    'core.infra.cache.cacheService': ICachesService;
    'core.utils': IUtils;
    translator: i18n;
}

export default function ({
    config,
    'core.domain.attribute': attributeDomain,
    'core.domain.value.helpers.getRecordFieldValue': getRecordFieldValueHelper,
    'core.domain.helpers.validate': validateHelper,
    'core.domain.helpers.getCoreEntityById': getCoreEntityById,
    'core.domain.tree.helpers.elementAncestors': elementAncestorsHelper,
    'core.domain.record.helpers.findRecords': findRecordsHelper,
    'core.infra.cache.cacheService': cacheService,
    'core.utils': utils,
    translator,
}: IDeps): GetRecordIdentityHelper {
    const _convertDateRangeToString = (dateRange: {from: string; to: string}, {lang}: IQueryInfos): string =>
        translator.t('labels.date_range', {
            from: dateRange.from,
            to: dateRange.to,
            lng: lang,
            interpolation: {escapeValue: false},
        });

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
    }): Promise<IPreview | null> => {
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

            let previewValues = await getRecordFieldValueHelper({
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
        const filePreviewsValue = await getRecordFieldValueHelper({
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

    const _getLibraryIconPreview = async (library: ILibrary, ctx: IQueryInfos): Promise<IPreview | null> => {
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

            let labelValues = await getRecordFieldValueHelper({
                library: lib.id,
                record,
                attributeId: conf.label,
                options: valuesOptions,
                ctx,
            });

            if (!labelValues.length) {
                return null;
            }

            labelValues = getValuesToDisplay(labelValues);

            if (!labelValues.length) {
                return null;
            }

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

            let colorValues = await getRecordFieldValueHelper({
                library: lib.id,
                record,
                attributeId: conf.color,
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
            if (conf.subLabel === 'id') {
                return record.id;
            }

            const subLabelAttributeProps = await attributeDomain.getAttributeProperties({id: conf.subLabel, ctx});

            let subLabelValues = await getRecordFieldValueHelper({
                library: lib.id,
                record,
                attributeId: conf.subLabel,
                options: valuesOptions,
                ctx,
            });

            subLabelValues = getValuesToDisplay(subLabelValues);

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

    const _getParentContext = async (record: IRecord, ctx: IQueryInfos): Promise<IRecordIdentity[] | null> => {
        if (!record) {
            return null;
        }

        const lib = await validateHelper.validateLibrary(record.library, ctx);
        const conf = lib.recordIdentityConf || {};
        const parentContext = conf.parentContext;

        // If no parent context attribute is defined, return null
        if (!parentContext) {
            return null;
        }

        const valuesOptions: IValuesOptions = {
            version: ctx.version ?? null,
        };

        // Get the value of the parent context attribute (must be a SIMPLE_LINK)
        let parentContextValues = await getRecordFieldValueHelper({
            library: lib.id,
            record,
            attributeId: parentContext,
            options: valuesOptions,
            ctx,
        });

        parentContextValues = getValuesToDisplay(parentContextValues);

        // If no value, return null (no parent context)
        if (!parentContextValues.length || !parentContextValues[0]?.payload) {
            return null;
        }

        const parentRecord: IRecord = parentContextValues[0].payload;

        // Get the full identity of the parent record
        const parentIdentity = await _getRecordIdentity(parentRecord, ctx);

        // Recursively get the parent context of the parent record
        const ancestorContext = await _getParentContext(parentRecord, ctx);

        // Build the context path: ancestors first, current parent first, then ancestors
        if (ancestorContext) {
            return [parentIdentity, ...ancestorContext];
        }

        return [parentIdentity];
    };

    const _getRecordIdentity = async (record: IRecord, ctx: IQueryInfos): Promise<IRecordIdentity> => {
        const lib = await validateHelper.validateLibrary(record.library, ctx);

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
                const treeValues = await getRecordFieldValueHelper({
                    library: lib.id,
                    record,
                    attributeId: conf.treeColorPreview,
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

        const getParentContext = conf.parentContext ? () => _getParentContext(record, ctx) : null;

        return {
            id: record.id,
            library: lib,
            getLabel,
            getSubLabel,
            getColor,
            getPreview,
            getParentContext,
        };
    };

    return _getRecordIdentity;
}
