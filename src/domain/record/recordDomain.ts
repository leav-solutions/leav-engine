import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import moment from 'moment';
import {join} from 'path';
import {ICursorPaginationParams, IListWithCursor, IPaginationParams} from '_types/list';
import {IValue, IValuesOptions} from '_types/value';
import PermissionError from '../../errors/PermissionError';
import {getPreviewUrl} from '../../utils/preview/preview';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import {ILibrary, LibraryBehavior} from '../../_types/library';
import {RecordPermissionsActions} from '../../_types/permissions';
import {IQueryInfos} from '../../_types/queryInfos';
import {IRecord, IRecordFilterOption, IRecordIdentity, IRecordIdentityConf} from '../../_types/record';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';

/**
 * Simple list of filters (fieldName: filterValue) to apply to get records.
 */
export interface IRecordFiltersLight {
    [attrId: string]: string;
}

export interface IFindRecordParams {
    library: string;
    filters?: IRecordFiltersLight;
    options?: IValuesOptions;
    pagination?: IPaginationParams | ICursorPaginationParams;
    withCount?: boolean;
    retrieveInactive?: boolean;
}

export interface IRecordDomain {
    createRecord(library: string, ctx: IQueryInfos): Promise<IRecord>;

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

    deleteRecord({library, id, ctx}: {library: string; id: number; ctx: IQueryInfos}): Promise<IRecord>;

    /**
     * Search records
     * Filters to apply on records selection
     * Fields to retrieve on each records
     */
    find({params, ctx}: {params: IFindRecordParams; ctx: IQueryInfos}): Promise<IListWithCursor<IRecord>>;

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
    }): Promise<IValue | IValue[]>;

    getRecordIdentity(record: IRecord, ctx: IQueryInfos): Promise<IRecordIdentity>;

    deactivateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord>;
    activateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord>;
}

interface IDeps {
    'core.infra.record'?: IRecordRepo;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.actionsList'?: IActionsListDomain;
    'core.domain.permission.recordPermission'?: IRecordPermissionDomain;
    'core.domain.library'?: ILibraryDomain;
}

export default function({
    'core.infra.record': recordRepo = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.value': valueDomain = null,
    'core.domain.actionsList': actionsListDomain = null,
    'core.domain.permission.recordPermission': recordPermissionDomain = null,
    'core.domain.library': libraryDomain = null
}: IDeps = {}): IRecordDomain {
    /**
     * Run actions list on a value
     *
     * @param isLinkAttribute
     * @param value
     * @param attrProps
     * @param record
     * @param library
     * @param ctx
     */
    const _runActionsList = async (
        isLinkAttribute: boolean,
        value: IValue,
        attrProps: IAttribute,
        record: IRecord,
        library: string,
        ctx: IQueryInfos
    ) =>
        !isLinkAttribute && value !== null && !!attrProps.actions_list && !!attrProps.actions_list.getValue
            ? actionsListDomain.runActionsList(attrProps.actions_list.getValue, value, {
                  ...ctx,
                  attribute: attrProps,
                  recordId: record.id,
                  library,
                  value
              })
            : value;

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
        let values;
        if (typeof record[attribute.id] !== 'undefined') {
            // Format attribute field into simple value
            values = [
                {
                    value: record[attribute.id]
                }
            ];
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

    /**
     * Format value: add a few informations for link attributes, run actions list
     *
     * @param attribute
     * @param value
     * @param record
     * @param library
     */
    const _formatRecordValue = async (
        attribute: IAttribute,
        value: IValue,
        record: IRecord,
        library: string,
        ctx: IQueryInfos
    ): Promise<IValue> => {
        let val = {...value}; // Don't mutate given value

        const isLinkAttribute =
            attribute.type === AttributeTypes.SIMPLE_LINK || attribute.type === AttributeTypes.ADVANCED_LINK;

        if (isLinkAttribute && attribute.linked_library) {
            if (attribute.type === AttributeTypes.SIMPLE_LINK) {
                val.value = {
                    id: val.value
                };
            }

            const linkValue = {...val.value, library: attribute.linked_library};
            val = {...value, value: linkValue};
        }

        const processedValue: IValue =
            !isLinkAttribute &&
            val !== null &&
            attribute.id !== 'id' &&
            !!attribute.actions_list &&
            !!attribute.actions_list.getValue
                ? await _runActionsList(isLinkAttribute, val, attribute, record, library, ctx)
                : val;

        processedValue.raw_value = val.value;
        processedValue.attribute = attribute.id;

        return processedValue;
    };

    return {
        async createRecord(library: string, ctx: IQueryInfos): Promise<IRecord> {
            const recordData = {
                created_at: moment().unix(),
                created_by: ctx.userId,
                modified_at: moment().unix(),
                modified_by: ctx.userId,
                active: true
            };

            return recordRepo.createRecord({libraryId: library, recordData, ctx});
        },
        async updateRecord({library, recordData, ctx}): Promise<IRecord> {
            // Check permission
            const canUpdate = await recordPermissionDomain.getRecordPermission(
                RecordPermissionsActions.DELETE,
                ctx.userId,
                recordData.library,
                recordData.id,
                ctx
            );

            if (!canUpdate) {
                throw new PermissionError(RecordPermissionsActions.DELETE);
            }

            return recordRepo.updateRecord({libraryId: library, recordData, ctx});
        },
        async deleteRecord({library, id, ctx}): Promise<IRecord> {
            // Get library
            // const lib = await this.getLibraries({id});

            // // Check if exists and can delete
            // if (!lib.length) {
            //     throw new Error('Unknown library');
            // }

            // if (lib.pop().system) {
            //     throw new Error('Cannot delete system library');
            // }

            // Check permission
            const canDelete = await recordPermissionDomain.getRecordPermission(
                RecordPermissionsActions.DELETE,
                ctx.userId,
                library,
                id,
                ctx
            );

            if (!canDelete) {
                throw new PermissionError(RecordPermissionsActions.DELETE);
            }

            return recordRepo.deleteRecord({libraryId: library, recordId: id, ctx});
        },
        async find({params, ctx}): Promise<IListWithCursor<IRecord>> {
            const {library, filters, pagination, withCount, retrieveInactive = false} = params;
            const fullFilters: IRecordFilterOption[] = [];

            // Hydrate filters with attribute properties and cast filters values if needed
            if (typeof filters !== 'undefined' && filters) {
                for (const attrId of Object.keys(filters)) {
                    const attribute = await attributeDomain.getAttributeProperties({id: attrId, ctx});
                    const value =
                        attribute.format === AttributeFormats.NUMERIC ? Number(filters[attrId]) : filters[attrId];

                    fullFilters.push({
                        attribute,
                        value
                    });
                }
            }

            const records = await recordRepo.find({
                libraryId: library,
                filters: fullFilters,
                pagination,
                withCount,
                retrieveInactive,
                ctx
            });

            return records;
        },
        async getRecordIdentity(record: IRecord, ctx: IQueryInfos): Promise<IRecordIdentity> {
            const lib = await libraryDomain.getLibraryProperties(record.library, ctx);
            const conf = lib.recordIdentityConf || {};

            return {
                id: record.id,
                library: lib,
                label: conf.label
                    ? (
                          await valueDomain.getValues({
                              library: lib.id,
                              recordId: record.id,
                              attribute: conf.label,
                              ctx
                          })
                      ).pop().value
                    : null,
                color: conf.color
                    ? (
                          await valueDomain.getValues({
                              library: lib.id,
                              recordId: record.id,
                              attribute: conf.color,
                              ctx
                          })
                      ).pop().value
                    : null,
                preview: (await getPreviews({conf, lib, record, valueDomain, libraryDomain, ctx})) ?? null
            };
        },
        async getRecordFieldValue({library, record, attributeId, options, ctx}): Promise<IValue | IValue[]> {
            const attrProps = await attributeDomain.getAttributeProperties({id: attributeId, ctx});
            const values = await _extractRecordValue(record, attrProps, library, options, ctx);
            const forceArray = options?.forceArray ?? false;

            const formattedValues = await Promise.all(
                values.map(v => _formatRecordValue(attrProps, v, record, library, ctx))
            );

            return attrProps.multiple_values || forceArray ? formattedValues : formattedValues[0];
        },
        async deactivateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord> {
            const savedVal = await valueDomain.saveValue({
                library: record.library,
                recordId: record.id,
                attribute: 'active',
                value: {value: false},
                ctx
            });

            return {...record, active: savedVal.value};
        },
        async activateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord> {
            const savedVal = await valueDomain.saveValue({
                library: record.library,
                recordId: record.id,
                attribute: 'active',
                value: {value: true},
                ctx
            });

            return {...record, active: savedVal.value};
        }
    };
}

interface IGetPreview {
    conf: IRecordIdentityConf;
    lib: ILibrary;
    record: IRecord;
    valueDomain: IValueDomain;
    libraryDomain: ILibraryDomain;
    ctx: any;
}

const getPreviews = async ({conf, lib, record, valueDomain, libraryDomain, ctx}: IGetPreview) => {
    const previewUrl = getPreviewUrl();
    const confPreview = lib.behavior === LibraryBehavior.FILES ? 'previews' : conf.preview;

    // can return a preview object or a full record for advance link
    const valuePreview = confPreview
        ? (
              await valueDomain.getValues({
                  library: lib.id,
                  recordId: record.id,
                  attribute: confPreview,
                  ctx
              })
          )?.pop()
        : null;

    const getPreviewFromRecord = async (valueRecord: IRecord) => {
        let previewAttribute: string;

        if (valueRecord.library) {
            const valueLib = await libraryDomain.getLibraryProperties(valueRecord.library, ctx);
            const valueConf = valueLib.recordIdentityConf || {};

            return valueConf.preview;
        } else {
            previewAttribute = 'previews';
        }

        return valueRecord[previewAttribute];
    };

    const previews = valuePreview?.value.id ? await getPreviewFromRecord(valuePreview?.value) : valuePreview?.value;

    // append preview url
    return previews
        ? Object.entries(previews)
              .map(value => {
                  const [key, url] = value;

                  if (!url || url.toString() === '') {
                      // avoid broken image
                      return {[key]: null};
                  }
                  // add host url to preview
                  const absoluteUrl = join(previewUrl, url.toString());

                  return {[key]: absoluteUrl};
              })
              .reduce((obj, o) => ({...obj, ...o}))
        : null;
};
