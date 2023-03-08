// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IDbService} from 'infra/db/dbService';
import {IAttribute} from '_types/attribute';
import {IQueryInfos} from '_types/queryInfos';
import {IValue, IValuesOptions} from '_types/value';
import {IAttributeTypesRepo, IAttributeWithRevLink} from '../attributeTypes/attributeTypesRepo';

export const VALUES_LINKS_COLLECTION = 'core_edge_values_links';
export const VALUES_COLLECTION = 'core_values';

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
        value: IValue;
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
        value: IValue;
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

    isValueUnique({
        library,
        recordId,
        attribute,
        value,
        ctx
    }: {
        library: string;
        recordId: string;
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
        options?: IValuesOptions;
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
    'core.infra.attributeTypes'?: IAttributeTypesRepo;
    'core.infra.db.dbService'?: IDbService;
}

export default function ({
    'core.infra.attributeTypes': attributeTypesRepo = null,
    'core.infra.db.dbService': dbService = null
}: IDeps = {}): IValueRepo {
    return {
        createValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.createValue({library, recordId, attribute, value, ctx});
        },
        updateValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.updateValue({library, recordId, attribute, value, ctx});
        },
        deleteValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.deleteValue({library, recordId, attribute, value, ctx});
        },
        isValueUnique({library, recordId, attribute, value, ctx}): Promise<boolean> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.isValueUnique({library, recordId, attribute, value, ctx});
        },
        getValues({library, recordId, attribute, forceGetAllValues, options, ctx}): Promise<IValue[]> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.getValues({
                library,
                recordId,
                attribute,
                forceGetAllValues,
                options,
                ctx
            });
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
