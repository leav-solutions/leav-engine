// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, AqlQuery, GeneratedAqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IQueryInfos} from '_types/queryInfos';
import {AttributeFormats, IAttribute} from '../../_types/attribute';
import {AttributeCondition, IRecordFilterOption, IRecordSort} from '../../_types/record';
import {IStandardValue, IValue} from '../../_types/value';
import {ATTRIB_COLLECTION_NAME} from '../attribute/attributeRepo';
import {IDbService} from '../db/dbService';
import {LIB_ATTRIB_COLLECTION_NAME} from '../library/libraryRepo';
import {BASE_QUERY_IDENTIFIER, IAttributeTypeRepo, IAttributeWithRepo} from './attributeTypesRepo';
import {GetConditionPart} from './helpers/getConditionPart';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.attributeTypes.helpers.getConditionPart'?: GetConditionPart;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.attributeTypes.helpers.getConditionPart': getConditionPart = null
}: IDeps = {}): IAttributeTypeRepo {
    async function _saveValue(
        library: string,
        recordId: string,
        attribute: IAttribute,
        value: IValue,
        ctx: IQueryInfos
    ): Promise<IValue> {
        const collec = dbService.db.collection(library);

        const res = await dbService.execute({
            query: aql`
                UPDATE ${{_key: recordId}}
                WITH ${{[attribute.id]: value.value}}
                IN ${collec}
                OPTIONS { keepNull: false }
                RETURN NEW`,
            ctx
        });

        const updatedDoc = res.length ? res[0] : {};

        return {
            value: typeof updatedDoc[attribute.id] !== 'undefined' ? updatedDoc[attribute.id] : null,
            created_by: null,
            modified_by: null
        };
    }

    function _getExtendedFilterPart(attributes: IAttribute[]): GeneratedAqlQuery {
        return aql`${
            attributes
                .map(a => a.id)
                .reduce((acc, value, i) => {
                    acc.push(aql`TRANSLATE(${value}, ${i ? acc[acc.length - 1] : aql`r`})`);
                    if (i) {
                        acc.shift();
                    }
                    return acc;
                }, [])[0]
        }`;
    }

    return {
        async createValue({library, recordId, attribute, value, ctx}): Promise<IStandardValue> {
            return _saveValue(library, recordId, attribute, value, ctx);
        },
        async updateValue({library, recordId, attribute, value, ctx}): Promise<IStandardValue> {
            return _saveValue(library, recordId, attribute, value, ctx);
        },
        async deleteValue({library, recordId, attribute, value, ctx}): Promise<IStandardValue> {
            return _saveValue(library, recordId, attribute, {...value, value: null}, ctx);
        },
        async isValueUnique({library, recordId, attribute, value, ctx}): Promise<boolean> {
            const query = aql`
                FOR r IN ${dbService.db.collection(library)} 
                    FILTER r._key != ${recordId} && r.${attribute.id} == ${value.value}
                    RETURN r._key
            `;

            const res = await dbService.execute({query, ctx});

            return !res.length;
        },
        async getValues({library, recordId, attribute, ctx}): Promise<IStandardValue[]> {
            const query = aql`
                FOR r IN ${dbService.db.collection(library)}
                    FILTER r._key == ${String(recordId)}
                    RETURN r.${attribute.id}
            `;
            const res = await dbService.execute({query, ctx});

            return [
                {
                    value: res[0],
                    attribute: attribute.id,
                    modified_by: null,
                    created_by: null
                }
            ];
        },
        filterQueryPart(
            attributes: IAttributeWithRepo[],
            filter: IRecordFilterOption,
            parentIdentifier = BASE_QUERY_IDENTIFIER
        ): AqlQuery {
            attributes[0].id = attributes[0].id === 'id' ? '_key' : attributes[0].id;

            const valueIdentifier = aql.literal(parentIdentifier + 'Val');
            let filterTarget: AqlQuery;
            let conditionApplied = filter.condition;
            if (
                [
                    AttributeCondition.VALUES_COUNT_EQUAL,
                    AttributeCondition.VALUES_COUNT_GREATER_THAN,
                    AttributeCondition.VALUES_COUNT_LOWER_THAN
                ].includes(filter.condition as AttributeCondition)
            ) {
                filterTarget = aql`COUNT(${aql.literal(parentIdentifier)}.${attributes[0].id}) ? 1 : 0`;

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
            } else {
                filterTarget =
                    attributes[0].format === AttributeFormats.EXTENDED && attributes.length > 1
                        ? _getExtendedFilterPart(attributes)
                        : aql`${aql.literal(parentIdentifier)}.${attributes[0].id}`;
            }

            const query: AqlQuery = aql`
                        LET ${valueIdentifier} = ${filterTarget}
                        FILTER ${getConditionPart(
                            valueIdentifier,
                            conditionApplied as AttributeCondition,
                            filter.value,
                            attributes[0]
                        )}`;

            return query;
        },
        sortQueryPart({attributes, order}: {attributes: IAttribute[]; order: string}): AqlQuery {
            attributes[0].id = attributes[0].id === 'id' ? '_key' : attributes[0].id;

            const query: AqlQuery =
                attributes[0].format === AttributeFormats.EXTENDED && attributes.length > 1
                    ? aql`SORT ${_getExtendedFilterPart(attributes)} ${order}`
                    : aql`SORT r.${attributes[0].id} ${order}`;

            return query;
        },
        async clearAllValues({attribute, ctx}): Promise<boolean> {
            const libAttribCollec = dbService.db.edgeCollection(LIB_ATTRIB_COLLECTION_NAME);

            // TODO: use aql template tag, and find out why it doesn't work :)
            const query = `
                FOR v
                IN 1 INBOUND '${ATTRIB_COLLECTION_NAME}/${attribute.id}'
                ${LIB_ATTRIB_COLLECTION_NAME}
                RETURN v
            `;

            const libraries = await dbService.execute({query, ctx});

            for (const lib of libraries) {
                const recordsCollec = dbService.db.collection(lib._key);
                const clearQuery = aql`
                    FOR r IN ${recordsCollec}
                    FILTER r.${attribute.id} != null
                    UPDATE r WITH {${attribute.id}: null} IN ${recordsCollec} OPTIONS {keepNull: false}
                `;

                await dbService.execute({query: clearQuery, ctx});
            }

            return true;
        }
    };
}
