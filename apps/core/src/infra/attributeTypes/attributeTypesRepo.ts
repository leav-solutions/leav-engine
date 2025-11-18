// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AqlLiteral, AqlQuery, type GeneratedAqlQuery} from 'arangojs/aql';
import {type IQueryInfos} from '_types/queryInfos';
import {AttributeTypes, type IAttribute} from '../../_types/attribute';
import {AttributeCondition, type IRecordFilterOption} from '../../_types/record';
import {
    type IBaseValueByAttributeType,
    type IValuesOccurrences,
    type ISaveValueByAttributeType,
    type IValueByAttributeType,
    type IValuesOptions,
    type IValueVersion,
} from '../../_types/value';
import {type IAttributeSimpleRepo} from './attributeSimpleRepo';
import {type IAttributeSimpleLinkRepo} from './attributeSimpleLinkRepo';
import {type IAttributeAdvancedRepo} from './attributeAdvancedRepo';
import {type IAttributeAdvancedLinkRepo} from './attributeAdvancedLinkRepo';
import {type IAttributeTreeRepo} from './attributeTreeRepo';

// To avoid some cyclic dependencies issues, we have to pass repo along attribute props
export type IAttributeWithRepo = IAttributeWithRevLink & {
    _repo: IAttributeTypeRepo;
};

type IAttributeRepoByType<AttributeType extends AttributeTypes | unknown> = AttributeType extends AttributeTypes.SIMPLE
    ? IAttributeSimpleRepo
    : AttributeType extends AttributeTypes.SIMPLE_LINK
      ? IAttributeSimpleLinkRepo
      : AttributeType extends AttributeTypes.ADVANCED
        ? IAttributeAdvancedRepo
        : AttributeType extends AttributeTypes.ADVANCED_LINK
          ? IAttributeAdvancedLinkRepo
          : AttributeType extends AttributeTypes.TREE
            ? IAttributeTreeRepo
            : IAttributeTypeRepo;

export interface IAttributeTypesRepo {
    getTypeRepo<AttributeType extends AttributeTypes | unknown>(
        attribute: IAttribute,
    ): IAttributeRepoByType<AttributeType>;
}

export interface IAttributeWithRevLink extends IAttribute {
    reverse_link?: IAttribute;
}

export type GetConditionPartParentFunc = (
    condition: AttributeCondition,
    value: string | number | boolean,
    attribute: IAttribute,
) => GetConditionPartFunc;

export type IGetValuesOptions = Pick<IValuesOptions, 'forceGetAllValues' | 'version'>;

export type GetConditionPartFunc = (valueIdentifier: string | AqlLiteral) => GeneratedAqlQuery;
/**
 * Define interface used for all attribute type specific files
 */
export interface IAttributeTypeRepo<
    AttributeType extends AttributeTypes = AttributeTypes,
    Value = IValueByAttributeType[AttributeType],
> {
    createValue({
        library,
        recordId,
        attribute,
        value,
        ctx,
    }: {
        library: string;
        recordId: string;
        attribute: IAttributeWithRevLink;
        value: ISaveValueByAttributeType[AttributeType];
        ctx: IQueryInfos;
    }): Promise<Value>;

    /**
     * Update an existing value. Field "id" is expected on the value
     */
    updateValue({
        library,
        recordId,
        attribute,
        value,
        ctx,
    }: {
        library: string;
        recordId: string;
        attribute: IAttributeWithRevLink;
        value: ISaveValueByAttributeType[AttributeType];
        ctx: IQueryInfos;
    }): Promise<Value>;

    /**
     * Delete an existing value. Field "id" is expected on the value
     */
    deleteValue({
        library,
        recordId,
        attribute,
        value,
        ctx,
    }: {
        library: string;
        recordId: string;
        attribute: IAttributeWithRevLink;
        value: Value;
        ctx: IQueryInfos;
    }): Promise<Value>;

    /**
     * Check if a value is unique
     */
    isValueUsed?({
        library,
        excludedRecordId,
        attribute,
        value,
        ctx,
    }: {
        library: string;
        excludedRecordId?: string;
        attribute: IAttribute;
        value: Value;
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
        ctx,
    }: {
        library: string;
        recordId: string;
        attribute: IAttributeWithRevLink;
        forceGetAllValues?: boolean;
        options?: IGetValuesOptions;
        ctx: IQueryInfos;
    }): Promise<Value[]>;

    /**
     * Get all values for given records and attribute
     *
     * @return Array<{}>    Return an empty array if no value found for each record
     */
    getValuesBatch({
        library,
        attribute,
        recordIds,
        options,
        ctx,
    }: {
        library: string;
        attribute: IAttributeWithRevLink;
        recordIds: string[];
        options?: IGetValuesOptions;
        ctx: IQueryInfos;
    }): Promise<Value[][]>;

    /**
     * Get all reverse values for given attribute / value
     *
     * @return Array<{}>    Return an empty array if no value found
     */
    getReverseValues?({
        advancedLinkAttr,
        ctx,
    }: {
        advancedLinkAttr: IAttributeWithRevLink;
        value: string;
        forceGetAllValues: boolean;
        ctx: IQueryInfos;
    }): Promise<Value[]>;

    /**
     * Get all reverse values for given attribute / values
     *
     * @return Array<{}>    Return an empty array if no value found for each record
     */
    getReverseValuesBatch?({
        advancedLinkAttr,
        ctx,
    }: {
        advancedLinkAttr: IAttributeWithRevLink;
        values: string[];
        forceGetAllValues: boolean;
        ctx: IQueryInfos;
    }): Promise<Value[][]>;

    countValuesOccurrences?({
        library,
        attribute,
        recordIds,
        options,
        ctx,
    }: {
        library: string;
        attribute: IAttribute;
        recordIds: string[];
        options?: {version?: IValueVersion};
        ctx: IQueryInfos;
    }): Promise<IValuesOccurrences<IBaseValueByAttributeType[AttributeType]>>;

    /**
     * Return a specific value based on its ID. Field "id" is expect on the value
     *
     * @return {}   Return null if no value found
     */
    getValueById?({
        library,
        recordId,
        attribute,
        valueId,
        ctx,
    }: {
        library: string;
        recordId: string;
        attribute: IAttribute;
        valueId: string;
        ctx: IQueryInfos;
    }): Promise<Value>;

    /**
     * Return AQL query part to retrieve value for this attribute.
     * If will be concatenate with other filters and full query
     */
    filterValueQueryPart(
        attributes: IAttributeWithRepo[],
        filter: IRecordFilterOption,
        parentIdentifier?: string,
    ): GeneratedAqlQuery;

    /**
     * Return AQL query part to sort on this attribute
     */
    sortQueryPart({attributes, order}: {attributes: IAttributeWithRevLink[]; order: string}): GeneratedAqlQuery;

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

export const isValuesCountCondition = (condition: AttributeCondition): boolean =>
    [
        AttributeCondition.VALUES_COUNT_EQUAL,
        AttributeCondition.VALUES_COUNT_GREATER_THAN,
        AttributeCondition.VALUES_COUNT_LOWER_THAN,
    ].includes(condition as AttributeCondition);

interface IDeps {
    'core.infra.attributeTypes.attributeSimple'?: IAttributeSimpleRepo;
    'core.infra.attributeTypes.attributeSimpleLink'?: IAttributeSimpleLinkRepo;
    'core.infra.attributeTypes.attributeAdvanced'?: IAttributeAdvancedRepo;
    'core.infra.attributeTypes.attributeAdvancedLink'?: IAttributeAdvancedLinkRepo;
    'core.infra.attributeTypes.attributeTree'?: IAttributeTreeRepo;
}

export default function ({
    'core.infra.attributeTypes.attributeSimple': attributeSimpleRepo = null,
    'core.infra.attributeTypes.attributeSimpleLink': attributeSimpleLinkRepo = null,
    'core.infra.attributeTypes.attributeAdvanced': attributeAdvancedRepo = null,
    'core.infra.attributeTypes.attributeAdvancedLink': attributeAdvancedLinkRepo = null,
    'core.infra.attributeTypes.attributeTree': attributeTreeRepo = null,
}: IDeps = {}): IAttributeTypesRepo {
    return {
        getTypeRepo<AttributeType extends AttributeTypes | unknown>(
            attribute: IAttribute,
        ): IAttributeRepoByType<AttributeType> {
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

            return attrTypeRepo as IAttributeRepoByType<AttributeType>;
        },
    };
}
