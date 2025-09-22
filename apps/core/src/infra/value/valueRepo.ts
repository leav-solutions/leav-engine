// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import DataLoader from 'dataloader';
import {type IDbService} from 'infra/db/dbService';
import {type IConfig} from '_types/config';
import {type IAttribute} from '_types/attribute';
import {type IQueryInfos} from '_types/queryInfos';
import {type ISaveValue, type IValue} from '_types/value';
import {type IAttributeTypesRepo, type IAttributeWithRevLink, type IGetValuesOptions} from '../attributeTypes/attributeTypesRepo';
import {getOrCreateDataLoaderInCtx} from '../../utils/dataloader';

export const VALUES_LINKS_COLLECTION = 'core_edge_values_links';
export const VALUES_COLLECTION = 'core_values';
export const EMPTY_VALUE = '__empty_value__';

export interface IValueRepo {
    createValue({
        library,
        recordId,
        attribute,
        value,
        ctx
    }: {
        library: string;
        recordId: string;
        attribute: IAttributeWithRevLink;
        value: ISaveValue;
        ctx: IQueryInfos;
    }): Promise<IValue>;

    /**
     * Update an existing value. Field "id" is expected on the value
     */
    updateValue({
        library,
        recordId,
        attribute,
        value,
        ctx
    }: {
        library: string;
        recordId: string;
        attribute: IAttributeWithRevLink;
        value: ISaveValue;
        ctx: IQueryInfos;
    }): Promise<IValue>;

    /**
     * Delete an existing value. Field "id" is expected on the value
     */
    deleteValue({
        library,
        recordId,
        attribute,
        value,
        ctx
    }: {
        library: string;
        recordId: string;
        attribute: IAttributeWithRevLink;
        value: IValue;
        ctx: IQueryInfos;
    }): Promise<IValue>;

    /**
     * Check if a value is unique expeted for the given record
     * if recordId is null, it will check for the whole library
     */
    isValueUsed({
        library,
        excludedRecordId,
        attribute,
        value,
        ctx
    }: {
        library: string;
        excludedRecordId?: string;
        attribute: IAttribute;
        value: IValue;
        ctx: IQueryInfos;
    }): Promise<boolean>;

    /**
     * Get all values for given record and attribute
     *
     * @return Array<{}>    Return an empty array if no value found
     */
    getValues({
        library,
        recordId,
        attribute,
        forceGetAllValues,
        options,
        ctx
    }: {
        library: string;
        recordId: string;
        attribute: IAttributeWithRevLink;
        forceGetAllValues?: boolean;
        options?: IGetValuesOptions;
        ctx: IQueryInfos;
    }): Promise<IValue[]>;

    /**
     * Return a specific value based on its ID. Field "id" is expect on the value
     *
     * @return {}   Return null if no value found
     */
    getValueById({
        library,
        recordId,
        attribute,
        valueId,
        ctx
    }: {
        library: string;
        recordId: string;
        attribute: IAttribute;
        valueId: string;
        ctx: IQueryInfos;
    }): Promise<IValue>;

    clearAllValues({attribute, ctx}: {attribute: IAttribute; ctx: IQueryInfos}): Promise<boolean>;

    deleteAllValuesByRecord(params: {libraryId: string; recordId: string; ctx: IQueryInfos}): Promise<void>;
}

interface IDeps {
    config?: IConfig;
    'core.infra.attributeTypes': IAttributeTypesRepo;
    'core.infra.db.dbService': IDbService;
}

type GetValuesDataLoader = DataLoader<string, IValue[]>;

export default function ({
    config,
    'core.infra.attributeTypes': attributeTypesRepo = null,
    'core.infra.db.dbService': dbService = null
}: IDeps): IValueRepo {
    const computeGetValuesDataLoaderKey = (
        libraryId: string,
        attribute: IAttributeWithRevLink,
        options: IGetValuesOptions
    ): string => {
        const suffix = options.forceGetAllValues
            ? '-all'
            : options.version
              ? `-version-${JSON.stringify(options.version)}`
              : '';
        return `valueRepo-getValues-${libraryId}-${attribute.id}${suffix}`;
    };

    const enableGetValueDataLoadersCache = config?.dataLoaders.valueRepo.getValues.enableCache ?? false;
    const useBatchGetValueDataLoaders = config?.dataLoaders.valueRepo.getValues.useBatch ?? true;
    const getValuesDataLoader = (
        libraryId: string,
        attribute: IAttributeWithRevLink,
        options: IGetValuesOptions,
        ctx: IQueryInfos
    ): GetValuesDataLoader => {
        const dataLoaderKey = computeGetValuesDataLoaderKey(libraryId, attribute, options);
        return getOrCreateDataLoaderInCtx<GetValuesDataLoader>(
            ctx,
            dataLoaderKey,
            () =>
                new DataLoader<string, IValue[]>(
                    async (recordIds: readonly string[]) => {
                        const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
                        return useBatchGetValueDataLoaders
                            ? typeRepo.getValuesBatch({
                                  library: libraryId,
                                  attribute,
                                  recordIds: recordIds as string[],
                                  options,
                                  ctx
                              })
                            : Promise.all(
                                  recordIds.map(recordId =>
                                      typeRepo.getValues({
                                          library: libraryId,
                                          recordId,
                                          attribute,
                                          forceGetAllValues: options.forceGetAllValues,
                                          options,
                                          ctx
                                      })
                                  )
                              );
                    },
                    {
                        cache: enableGetValueDataLoadersCache
                    }
                )
        );
    };

    return {
        createValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.createValue({
                library,
                recordId,
                attribute,
                value,
                ctx
            });
        },
        updateValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.updateValue({
                library,
                recordId,
                attribute,
                value,
                ctx
            });
        },
        deleteValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.deleteValue({
                library,
                recordId,
                attribute,
                value,
                ctx
            });
        },
        isValueUsed({library, excludedRecordId, attribute, value, ctx}): Promise<boolean> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.isValueUsed({library, excludedRecordId, attribute, value, ctx});
        },
        getValues({library, recordId, attribute, forceGetAllValues, options, ctx}): Promise<IValue[]> {
            return getValuesDataLoader(library, attribute, {...options, forceGetAllValues}, ctx).load(recordId);
        },
        getValueById({library, recordId, attribute, valueId, ctx}): Promise<IValue> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.getValueById({
                library,
                recordId,
                attribute,
                valueId,
                ctx
            });
        },
        clearAllValues({attribute, ctx}): Promise<boolean> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.clearAllValues({attribute, ctx});
        },
        async deleteAllValuesByRecord({libraryId, recordId, ctx}) {
            const collection = dbService.db.collection(VALUES_LINKS_COLLECTION);

            await dbService.execute({
                query: aql`
                    FOR l IN ${collection}
                        FILTER l._from == ${libraryId + '/' + recordId} OR l._to == ${libraryId + '/' + recordId}
                        REMOVE {_key: l._key} IN ${collection}
                `,
                ctx
            });
        }
    };
}
