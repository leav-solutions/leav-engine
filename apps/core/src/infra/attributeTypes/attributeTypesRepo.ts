// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, AqlLiteral, AqlQuery, GeneratedAqlQuery} from 'arangojs/lib/cjs/aql-query';
import moment from 'moment';
import {IQueryInfos} from '_types/queryInfos';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import {AttributeCondition, IDateFilterValue, IRecordSort} from '../../_types/record';
import {IValue, IValuesOptions} from '../../_types/value';

// To avoid some cyclic dependencies issues, we have to pass repo along attribute props
export interface IAttributeWithRepo extends IAttribute {
    _repo: IAttributeTypeRepo;
}

export interface IAttributeTypesRepo {
    getTypeRepo?(attribute: IAttribute): IAttributeTypeRepo;
    getConditionPart?: GetConditionPartParentFunc;
}

export type GetConditionPartParentFunc = (
    condition: AttributeCondition,
    value: string | number | boolean,
    attribute: IAttribute
) => GetConditionPartFunc;

export type GetConditionPartFunc = (valueIdentifier: string | AqlLiteral) => GeneratedAqlQuery;
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
        getConditionPart: GetConditionPartFunc,
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
        getConditionPart(
            condition: AttributeCondition,
            value: string | number | boolean | IDateFilterValue,
            attribute: IAttribute
        ): GetConditionPartFunc {
            return (valueIdentifier: string | AqlLiteral): GeneratedAqlQuery => {
                const valueField = typeof valueIdentifier === 'string' ? aql.literal(valueIdentifier) : valueIdentifier;

                switch (condition) {
                    case AttributeCondition.EQUAL: {
                        const cond =
                            attribute.format === AttributeFormats.DATE
                                ? aql`DATE_COMPARE(${valueField} * 1000, ${
                                      Number(value) * 1000
                                  }, "years", "days") == true`
                                : aql`${valueField} == ${value}`;

                        return cond;
                    }
                    case AttributeCondition.NOT_EQUAL:
                        return attribute.format === AttributeFormats.DATE
                            ? aql`DATE_COMPARE(${valueField} * 1000, ${Number(value) * 1000}, "years", "days") == false`
                            : aql`${valueField} != ${value}`;
                    case AttributeCondition.BEGIN_WITH:
                        return aql`${valueField} LIKE ${`${value}%`}`;
                    case AttributeCondition.END_WITH:
                        return aql`${valueField} LIKE ${`%${value}`}`;
                    case AttributeCondition.CONTAINS: {
                        return attribute.format === AttributeFormats.DATE_RANGE
                            ? aql`${Number(value)} >= ${valueField}.from AND ${Number(value)} <= ${valueField}.to`
                            : aql`${valueField} LIKE ${`%${value}%`}`;
                    }
                    case AttributeCondition.NOT_CONTAINS:
                        return aql`${valueField} NOT LIKE ${`%${value}%`}`;
                    case AttributeCondition.GREATER_THAN:
                        return aql`${valueField} > ${Number(value)}`;
                    case AttributeCondition.LESS_THAN:
                        return aql`${valueField} != null AND ${valueField} < ${Number(value)}`;
                    case AttributeCondition.IS_EMPTY:
                        return aql`${valueField} == null`;
                    case AttributeCondition.IS_NOT_EMPTY:
                        return aql`${valueField} != null`;
                    case AttributeCondition.BETWEEN:
                        return aql`(
                            ${valueField} >= ${Number((value as IDateFilterValue).from)}
                            AND ${valueField} <= ${Number((value as IDateFilterValue).to)}
                        )`;
                    case AttributeCondition.TODAY:
                        return aql`DATE_COMPARE(${valueField} * 1000, DATE_NOW(), "years", "days") == true`;
                    case AttributeCondition.YESTERDAY:
                        return aql`DATE_COMPARE(
                            ${valueField} * 1000,
                            DATE_SUBTRACT(DATE_NOW(), 1, "day"),
                            "years",
                            "days"
                        ) == true`;
                    case AttributeCondition.TOMORROW:
                        return aql`DATE_COMPARE(
                            ${valueField} * 1000,
                            DATE_ADD(DATE_NOW(), 1, "day"),
                            "years",
                            "days"
                        ) == true`;
                    case AttributeCondition.NEXT_MONTH: {
                        const now = moment().unix();
                        const nextMonth = moment().add(31, 'days').unix();
                        return aql`${valueField} >= ${now} AND ${valueField} <=${nextMonth}`;
                    }
                    case AttributeCondition.LAST_MONTH: {
                        const now = moment().unix();
                        const lastMonth = moment().subtract(31, 'days').unix();
                        return aql`${valueField} >= ${lastMonth} AND ${valueField} <=${now}`;
                    }
                    case AttributeCondition.START_ON:
                        return aql`DATE_COMPARE(${valueField}.from * 1000, ${
                            Number(value) * 1000
                        }, "years", "days") == true`;
                    case AttributeCondition.START_BEFORE:
                        return aql`${valueField}.from != null AND ${valueField}.from < ${Number(value)}`;
                    case AttributeCondition.START_AFTER:
                        return aql`${valueField}.from > ${Number(value)}`;
                    case AttributeCondition.END_ON:
                        return aql`DATE_COMPARE(${valueField}.to * 1000, ${
                            Number(value) * 1000
                        }, "years", "days") == true`;
                    case AttributeCondition.END_BEFORE:
                        return aql`${valueField}.to != null AND ${valueField}.to < ${Number(value)}`;
                    case AttributeCondition.END_AFTER:
                        return aql`${valueField}.to > ${Number(value)}`;
                    default:
                        return aql`${valueField} == ${value}`;
                }
            };
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
