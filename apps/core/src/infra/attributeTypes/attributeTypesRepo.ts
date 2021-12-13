// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, AqlQuery, GeneratedAqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IQueryInfos} from '_types/queryInfos';
import {AttributeTypes, IAttribute} from '../../_types/attribute';
import {AttributeCondition, IRecordSort} from '../../_types/record';
import {IValue, IValuesOptions} from '../../_types/value';

// To avoid some cyclic dependencies issues, we have to pass repo along attribute props
export interface IAttributeWithRepo extends IAttribute {
    _repo: IAttributeTypeRepo;
}

export interface IAttributeTypesRepo {
    getTypeRepo?(attribute: IAttribute): IAttributeTypeRepo;
    getQueryPart?(value: string | number | boolean, condition: AttributeCondition): GeneratedAqlQuery;
}

/**
 * Define interface used for all attribute type specific files
 */
export interface IAttributeTypeRepo {
    createValue({
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
        attribute: IAttribute;
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
        attribute: IAttribute;
        value: IValue;
        ctx: IQueryInfos;
    }): Promise<IValue>;

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
        attribute: IAttribute;
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

    /**
     * Return AQL query part to filter on this attribute. If will be concatenate with other filters and full query
     */
    filterQueryPart(
        attributes: IAttributeWithRepo[],
        queryPart: GeneratedAqlQuery,
        parentIdentifier?: string
    ): AqlQuery;

    /**
     * Return AQL query part to sort on this attribute
     */
    sortQueryPart({attributes, order}: IRecordSort): AqlQuery;

    /**
     * Clear all values of given attribute. Can be used to cleanup values when an attribute is deleted for example.
     *
     * @param attribute
     * @return Promise<number> TRUE if operation succeed
     */
    clearAllValues({attribute, ctx}: {attribute: IAttribute; ctx: IQueryInfos}): Promise<boolean>;
}

export const ATTRIB_COLLECTION_NAME = 'core_attributes';
export const BASE_QUERY_IDENTIFIER = 'r';

interface IDeps {
    'core.infra.attributeTypes.attributeSimple'?: IAttributeTypeRepo;
    'core.infra.attributeTypes.attributeSimpleLink'?: IAttributeTypeRepo;
    'core.infra.attributeTypes.attributeAdvanced'?: IAttributeTypeRepo;
    'core.infra.attributeTypes.attributeAdvancedLink'?: IAttributeTypeRepo;
    'core.infra.attributeTypes.attributeTree'?: IAttributeTypeRepo;
}

export default function ({
    'core.infra.attributeTypes.attributeSimple': attributeSimpleRepo = null,
    'core.infra.attributeTypes.attributeSimpleLink': attributeSimpleLinkRepo = null,
    'core.infra.attributeTypes.attributeAdvanced': attributeAdvancedRepo = null,
    'core.infra.attributeTypes.attributeAdvancedLink': attributeAdvancedLinkRepo = null,
    'core.infra.attributeTypes.attributeTree': attributeTreeRepo = null
}: IDeps = {}): IAttributeTypesRepo {
    return {
        getQueryPart(value: string | number | boolean, condition: AttributeCondition): GeneratedAqlQuery {
            const parts = {
                [AttributeCondition.EQUAL]: aql.join([aql`==`, aql`${value}`]),
                [AttributeCondition.NOT_EQUAL]: aql.join([aql`!=`, aql`${value}`]),
                [AttributeCondition.BEGIN_WITH]: aql.join([aql`LIKE`, aql.literal(`"${value}%"`)]),
                [AttributeCondition.END_WITH]: aql.join([aql`LIKE`, aql.literal(`"%${value}"`)]),
                [AttributeCondition.CONTAINS]: aql.join([aql`LIKE`, aql.literal(`"%${value}%"`)]),
                [AttributeCondition.NOT_CONTAINS]: aql.join([aql`NOT LIKE`, aql.literal(`"%${value}%"`)]),
                [AttributeCondition.GREATER_THAN]: aql.join([aql`>`, aql`${value}`]),
                [AttributeCondition.LESS_THAN]: aql.join([aql`<`, aql`${value}`])
            };

            return parts[condition];
        },
        getTypeRepo(attribute) {
            let attrTypeRepo: IAttributeTypeRepo;
            switch (attribute.type) {
                case AttributeTypes.SIMPLE:
                    attrTypeRepo = attributeSimpleRepo;
                    break;
                case AttributeTypes.SIMPLE_LINK:
                    attrTypeRepo = attributeSimpleLinkRepo;
                    break;
                case AttributeTypes.ADVANCED:
                    attrTypeRepo = attributeAdvancedRepo;
                    break;
                case AttributeTypes.ADVANCED_LINK:
                    attrTypeRepo = attributeAdvancedLinkRepo;
                    break;
                case AttributeTypes.TREE:
                    attrTypeRepo = attributeTreeRepo;
                    break;
            }

            return attrTypeRepo;
        }
    };
}
