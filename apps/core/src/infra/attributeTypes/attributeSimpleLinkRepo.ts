// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, AqlQuery} from 'arangojs/lib/cjs/aql-query';
import {AttributeFormats, IAttribute} from '../../_types/attribute';
import {AttributeCondition, IRecordFilterOption, IRecordSort} from '../../_types/record';
import {ILinkValue, IStandardValue} from '../../_types/value';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {BASE_QUERY_IDENTIFIER, IAttributeTypeRepo, IAttributeWithRepo} from './attributeTypesRepo';
import {GetConditionPart} from './helpers/getConditionPart';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.attributeTypes.attributeSimple'?: IAttributeTypeRepo;
    'core.infra.attributeTypes.helpers.getConditionPart'?: GetConditionPart;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.attributeTypes.attributeSimple': attributeSimpleRepo = null,
    'core.infra.attributeTypes.helpers.getConditionPart': getConditionPart = null
}: IDeps = {}): IAttributeTypeRepo {
    function _getExtendedFilterPart(attributes: IAttribute[], linkedValue: AqlQuery): AqlQuery {
        return attributes
            .map(a => a.id)
            .slice(2)
            .reduce((acc, value, i) => {
                acc.push(aql`TRANSLATE(${value}, ${i ? acc[acc.length - 1] : aql`${linkedValue}`})`);
                if (i) {
                    acc.shift();
                }
                return acc;
            }, [])[0];
    }

    const _buildLinkValue = (savedValue: IStandardValue, attribute: IAttribute): ILinkValue => ({
        ...savedValue,
        value: {id: savedValue.value, library: attribute.linked_library}
    });

    return {
        async createValue(args): Promise<ILinkValue> {
            const savedVal = await attributeSimpleRepo.createValue(args);

            return _buildLinkValue(savedVal, args.attribute);
        },
        async updateValue(args): Promise<ILinkValue> {
            const savedVal = await attributeSimpleRepo.updateValue(args);

            return _buildLinkValue(savedVal, args.attribute);
        },
        async deleteValue(args): Promise<ILinkValue> {
            const deletedValue = await attributeSimpleRepo.deleteValue(args);

            return _buildLinkValue(deletedValue, args.attribute);
        },
        // To get values from advanced reverse link attribute into simple link.
        async getReverseValues({advancedLinkAttr, value, forceGetAllValues = false, ctx}): Promise<ILinkValue[]> {
            const libCollec = dbService.db.collection(advancedLinkAttr.linked_library);
            const queryParts = [];

            queryParts.push(aql`
                FOR r IN ${libCollec}
                    FILTER r.${(advancedLinkAttr.reverse_link as IAttribute)?.id} == ${value}`);

            const limitOne = aql.literal(!advancedLinkAttr.multiple_values && !forceGetAllValues ? 'LIMIT 1' : '');

            queryParts.push(aql`
                ${limitOne}
                RETURN r
            `);

            const query = aql.join(queryParts);
            const res = await dbService.execute({query, ctx});

            return res.map(r => ({id_value: null, value: dbUtils.cleanup(r), created_by: null, modified_by: null}));
        },
        async getValues({library, recordId, attribute, ctx}): Promise<ILinkValue[]> {
            const libCollec = dbService.db.collection(library);
            const linkedLibCollec = dbService.db.collection(attribute.linked_library);

            const res = await dbService.execute({
                query: aql`
                    FOR r IN ${libCollec}
                        FILTER r._key == ${recordId}
                        FOR l IN ${linkedLibCollec}
                            FILTER r.${attribute.id} == l._key
                            RETURN l
                `,
                ctx
            });

            return res
                .slice(0, 1)
                .map(r => ({id_value: null, value: dbUtils.cleanup(r), created_by: null, modified_by: null}));
        },
        sortQueryPart({attributes, order}: {attributes: IAttribute[]; order: string}): AqlQuery {
            const linkedLibCollec = dbService.db.collection(attributes[0].linked_library);
            const linked = !attributes[1]
                ? {id: '_key', format: AttributeFormats.TEXT}
                : attributes[1].id === 'id'
                ? {...attributes[1], id: '_key'}
                : attributes[1];

            const linkedValue = aql`
                FIRST(FOR l IN ${linkedLibCollec}
                    FILTER TO_STRING(r.${attributes[0].id}) == l._key
                RETURN l.${linked.id})
            `;

            const query: AqlQuery =
                linked.format !== AttributeFormats.EXTENDED
                    ? aql`SORT ${linkedValue} ${order}`
                    : aql`SORT ${_getExtendedFilterPart(attributes, linkedValue)} ${order}`;

            return query;
        },
        filterQueryPart(
            attributes: IAttributeWithRepo[],
            filter: IRecordFilterOption,
            parentIdentifier = BASE_QUERY_IDENTIFIER
        ): AqlQuery {
            const linkedLibCollec = dbService.db.collection(attributes[0].linked_library);
            const linked = !attributes[1]
                ? {id: '_key', format: AttributeFormats.TEXT}
                : attributes[1].id === 'id'
                ? {...attributes[1], id: '_key'}
                : attributes[1];

            const retrieveValue = aql`FOR l IN ${linkedLibCollec}
                FILTER TO_STRING(r.${attributes[0].id}) == l._key`;
            const returnValue = aql`RETURN l`;

            let query: AqlQuery;
            const linkValIdentifier = aql.literal(`${parentIdentifier}linkVal`);
            if (
                [
                    AttributeCondition.VALUES_COUNT_EQUAL,
                    AttributeCondition.VALUES_COUNT_GREATER_THAN,
                    AttributeCondition.VALUES_COUNT_LOWER_THAN
                ].includes(filter.condition as AttributeCondition)
            ) {
                let conditionApplied = filter.condition;
                switch (filter.condition) {
                    case AttributeCondition.VALUES_COUNT_EQUAL:
                        conditionApplied = AttributeCondition.EQUAL;
                        break;
                    case AttributeCondition.VALUES_COUNT_GREATER_THAN:
                        conditionApplied = AttributeCondition.GREATER_THAN;
                        break;
                    case AttributeCondition.VALUES_COUNT_LOWER_THAN:
                        conditionApplied = AttributeCondition.LESS_THAN;
                        break;
                }

                query = aql.join([
                    aql`LET ${linkValIdentifier} = `,
                    aql`COUNT(`,
                    retrieveValue,
                    returnValue,
                    aql`) ? 1 : 0`,
                    aql`FILTER ${getConditionPart(
                        linkValIdentifier,
                        conditionApplied as AttributeCondition,
                        filter.value,
                        attributes[0]
                    )}`
                ]);
            } else if (
                filter.condition === AttributeCondition.IS_EMPTY ||
                filter.condition === AttributeCondition.IS_NOT_EMPTY
            ) {
                query = aql.join([
                    aql`LET ${linkValIdentifier} = `,
                    aql`FIRST(`,
                    retrieveValue,
                    returnValue,
                    aql`)`,
                    aql`FILTER ${getConditionPart(linkValIdentifier, filter.condition, filter.value, attributes[0])}`
                ]);
            } else {
                const filterLinkedValue = attributes[1]
                    ? attributes[1]._repo.filterQueryPart([...attributes].splice(1), filter, 'l')
                    : null;

                const linkedValue = aql.join([aql`FIRST(`, retrieveValue, filterLinkedValue, returnValue, aql`)`]);

                query =
                    linked.format !== AttributeFormats.EXTENDED
                        ? aql`FILTER ${linkedValue} != null`
                        : aql`FILTER ${_getExtendedFilterPart(attributes, linkedValue)} != null`;
            }

            return query;
        },
        async clearAllValues(args): Promise<boolean> {
            return true;
        }
    };
}
