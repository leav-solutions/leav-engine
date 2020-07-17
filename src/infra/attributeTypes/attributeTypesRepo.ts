import {aql, AqlQuery, GeneratedAqlQuery} from 'arangojs/lib/cjs/aql-query';
import {AttributeTypes, IAttribute} from '../../_types/attribute';
import {IValue, IValuesOptions} from '../../_types/value';
import {IQueryInfos} from '_types/queryInfos';
import {IRecordSort, Condition} from '../../_types/record';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {Console} from 'console';

export interface IAttributeTypesRepo {
    getTypeRepo?(attribute: IAttribute): IAttributeTypeRepo;
    getQueryPart?(value: string | number | boolean, condition: Condition): GeneratedAqlQuery;
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
        recordId: number;
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
        recordId: number;
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
        recordId: number;
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
        recordId: number;
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
        value,
        ctx
    }: {
        library: string;
        recordId: number;
        attribute: IAttribute;
        value: IValue;
        ctx: IQueryInfos;
    }): Promise<IValue>;

    /**
     * Return AQL query part to filter on this attribute. If will be concatenate with other filters and full query
     */
    filterQueryPart(attributes: IAttribute[], queryPart: GeneratedAqlQuery, index?: number): AqlQuery;

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

interface IDeps {
    'core.infra.attributeTypes.attributeSimple'?: IAttributeTypeRepo;
    'core.infra.attributeTypes.attributeSimpleLink'?: IAttributeTypeRepo;
    'core.infra.attributeTypes.attributeAdvanced'?: IAttributeTypeRepo;
    'core.infra.attributeTypes.attributeAdvancedLink'?: IAttributeTypeRepo;
    'core.infra.attributeTypes.attributeTree'?: IAttributeTypeRepo;
}

export default function({
    'core.infra.attributeTypes.attributeSimple': attributeSimpleRepo = null,
    'core.infra.attributeTypes.attributeSimpleLink': attributeSimpleLinkRepo = null,
    'core.infra.attributeTypes.attributeAdvanced': attributeAdvancedRepo = null,
    'core.infra.attributeTypes.attributeAdvancedLink': attributeAdvancedLinkRepo = null,
    'core.infra.attributeTypes.attributeTree': attributeTreeRepo = null
}: IDeps = {}): IAttributeTypesRepo {
    return {
        getQueryPart(value: string | number | boolean, condition: Condition = Condition.EQUAL): GeneratedAqlQuery {
            const parts = {
                [Condition.EQUAL]: aql.join([aql`==`, aql`${value}`]),
                [Condition.NOT_EQUAL]: aql.join([aql`!=`, aql`${value}`]),
                [Condition.BEGIN_WITH]: aql.join([aql`LIKE`, aql.literal(`"${value}%"`)]),
                [Condition.END_WITH]: aql.join([aql`LIKE`, aql.literal(`"%${value}"`)]),
                [Condition.CONTAINS]: aql.join([aql`LIKE`, aql.literal(`"%${value}%"`)]),
                [Condition.NOT_CONTAINS]: aql.join([aql`NOT LIKE`, aql.literal(`"%${value}%"`)]),
                [Condition.GREATER_THAN]: aql.join([aql`>`, aql`${value}`]),
                [Condition.LESS_THAN]: aql.join([aql`<`, aql`${value}`])
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
