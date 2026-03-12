// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, type GeneratedAqlQuery, join, literal} from 'arangojs/aql';
import {type IDbDocument} from 'infra/db/_types';
import {type IFilterTypesHelper} from 'infra/record/helpers/filterTypes';
import {type IRecord} from '_types/record';
import {AttributeFormats, AttributeTypes, type IAttribute} from '../../_types/attribute';
import {type ILinkBaseValue, type ILinkValue, type IDistinctValue} from '../../_types/value';
import {type IDbService} from '../db/dbService';
import {type IDbUtils} from '../db/dbUtils';
import {BASE_QUERY_IDENTIFIER, type IAttributeTypeRepo, IAttributeWithRevLink} from './attributeTypesRepo';
import {type GetConditionPart} from './helpers/getConditionPart';
import {type IAttributeSimpleRepo} from './attributeSimpleRepo';
import _ from 'lodash';
import {type IQueryInfos} from '_types/queryInfos';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.attributeTypes.attributeSimple'?: IAttributeSimpleRepo;
    'core.infra.attributeTypes.helpers.getConditionPart'?: GetConditionPart;
    'core.infra.record.helpers.filterTypes'?: IFilterTypesHelper;
}

export type IAttributeSimpleLinkRepo = IAttributeTypeRepo<AttributeTypes.SIMPLE_LINK> & {
    deleteAllLinkValueTo(
        library: string,
        attribute: IAttribute,
        linkedRecordId: string,
        ctx: IQueryInfos,
    ): Promise<void>;
};

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.attributeTypes.attributeSimple': attributeSimpleRepo = null,
    'core.infra.attributeTypes.helpers.getConditionPart': getConditionPart = null,
    'core.infra.record.helpers.filterTypes': filterTypesHelper = null,
}: IDeps = {}): IAttributeSimpleLinkRepo {
    function _getExtendedFilterPart(attributes: IAttribute[], linkedValue: GeneratedAqlQuery): GeneratedAqlQuery {
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

    const _saveValue: IAttributeSimpleLinkRepo['createValue'] = async ({library, recordId, attribute, value, ctx}) => {
        if (typeof value.payload !== 'string') {
            throw new Error('Simple link attribute value must be a string representing the linked record ID.');
        }
        const collec = dbService.db.collection(library);

        const res = await dbService.execute<Array<{doc: IDbDocument; linkedRecord: IRecord}>>({
            query: aql`
                    LET linkedRecord = DOCUMENT(${attribute.linked_library}, ${value.payload})
                    UPDATE ${{_key: recordId}} WITH ${{[attribute.id]: value.payload}} IN ${collec}
                    OPTIONS { keepNull: false }
                    RETURN {doc: NEW, linkedRecord}`,
            ctx,
        });

        const updatedDoc = res.length ? res[0] : null;

        const savedVal = {
            id_value: null,
            attribute: attribute.id,
            payload: updatedDoc?.doc?.[attribute.id]
                ? {...dbUtils.cleanup(updatedDoc.linkedRecord), library: attribute.linked_library}
                : null,
            created_by: null,
            modified_by: null,
        };

        return savedVal;
    };

    return {
        async createValue(args): Promise<ILinkValue> {
            return _saveValue(args);
        },
        async updateValue(args): Promise<ILinkValue> {
            return _saveValue(args);
        },
        async deleteValue(args): Promise<ILinkValue | null> {
            const deletedValue = await attributeSimpleRepo.deleteValue({
                ...args,
                attribute: {
                    ...args.attribute,
                    type: AttributeTypes.SIMPLE,
                },
            });

            return {
                ...deletedValue,
                payload: {id: deletedValue.payload, library: args.attribute.linked_library},
            };
        },
        // To get values from advanced reverse link attribute into simple link.
        async getReverseValues({advancedLinkAttr, value, forceGetAllValues = false, ctx}): Promise<ILinkValue[]> {
            const libCollec = dbService.db.collection(advancedLinkAttr.linked_library);
            const queryParts = [];

            queryParts.push(aql`
                FOR r IN ${libCollec}
                    FILTER r.${(advancedLinkAttr.reverse_link as IAttribute)?.id} == ${value}`);

            const limitOne = literal(!advancedLinkAttr.multiple_values && !forceGetAllValues ? 'LIMIT 1' : '');

            queryParts.push(aql`
                ${limitOne}
                RETURN r
            `);

            const query = join(queryParts);
            const res = await dbService.execute({query, ctx});

            // id value of advanced revert link is the id of the record
            return res.map(r => {
                const record = dbUtils.cleanup<IRecord>({...r, library: advancedLinkAttr.linked_library});
                return {id_value: record.id, payload: record, created_by: null, modified_by: null};
            });
        },
        // To get values from advanced reverse link attribute into simple link.
        async getReverseValuesBatch({
            advancedLinkAttr,
            values,
            forceGetAllValues = false,
            ctx,
        }): Promise<ILinkValue[][]> {
            const libCollec = dbService.db.collection(advancedLinkAttr.linked_library);
            const query = aql`
                FOR r IN ${libCollec}
                    FILTER r.${(advancedLinkAttr.reverse_link as IAttribute)?.id} IN ${values}
                    COLLECT recordId = r.${(advancedLinkAttr.reverse_link as IAttribute)?.id} INTO grouped
                    RETURN {
                        recordId,
                        records: ${!advancedLinkAttr.multiple_values && !forceGetAllValues ? aql`SLICE(grouped[*].r, 0, 1)` : aql`grouped[*].r`} 
                    }
            `;
            const res = await dbService.execute<Array<{recordId: string; records: IRecord[]}>>({query, ctx});

            const valuesByRecordId = new Map(res.map(r => [r.recordId, r]));
            return values.map(recordId => {
                const val = valuesByRecordId.get(recordId);
                return (
                    val?.records.map(r => {
                        const rec = dbUtils.cleanup<IRecord>({...r, library: advancedLinkAttr.linked_library});
                        return {
                            id_value: rec.id,
                            payload: rec,
                            created_by: null,
                            modified_by: null,
                        };
                    }) || []
                );
            });
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
                ctx,
            });

            return res
                .filter(r => !!r)
                .slice(0, 1)
                .map(r => ({
                    id_value: null,
                    payload: dbUtils.cleanup({...r, library: attribute.linked_library}),
                    attribute: attribute.id,
                    created_by: null,
                    modified_by: null,
                }));
        },
        async getValuesBatch({library, recordIds, attribute, ctx}): Promise<ILinkValue[][]> {
            const libCollec = dbService.db.collection(library);
            const linkedLibCollec = dbService.db.collection(attribute.linked_library);

            const res = await dbService.execute<Array<{recordId: string; link: ILinkValue | null}>>({
                query: aql`
                    FOR rec IN ${libCollec}
                        FILTER rec._key IN ${recordIds}
                        LET link = rec && rec.${attribute.id} ? DOCUMENT(${linkedLibCollec}, rec.${attribute.id}) : null
                        RETURN { recordId: rec._key, link }
                `,
                ctx,
            });

            const valuesByRecordId = new Map(res.map(r => [r.recordId, r]));
            return recordIds.map(
                recordId => {
                    const record = valuesByRecordId.get(recordId);
                    const payload = record?.link;
                    return payload !== null && payload !== undefined
                        ? [
                              {
                                  id_value: null,
                                  payload: dbUtils.cleanup({...payload, library: attribute.linked_library}),
                                  attribute: attribute.id,
                                  modified_by: null,
                                  created_by: null,
                              },
                          ]
                        : [];
                },
                {} as Record<string, ILinkValue[]>,
            );
        },
        async listDistinctValues({library, attribute, recordIds, ctx}): Promise<IDistinctValue<ILinkBaseValue>> {
            const libCollec = dbService.db.collection(library);

            // For all recordIds, retrieve the linked value and count the occurrences of each linked value
            const query = aql`
                FOR rec IN ${libCollec}
                    FILTER rec._key IN ${recordIds}

                    // Keep only record with linked value
                    LET linkedId = rec.${attribute.id}
                    FILTER linkedId != null
                    
                    // Group by linkedId and count occurrences
                    COLLECT recordId = linkedId WITH COUNT INTO count
                    RETURN { recordId, count }
            `;

            const res = await dbService.execute<Array<{recordId: string; count: number}>>({query, ctx});

            // Compute total occurrences to find unlinked records, each recordId without linked value counts as 1
            const countOccurrences = _.sum(res.map(r => r.count));

            return res
                .map(({recordId, count}) => ({
                    value: {id: recordId, library: attribute.linked_library},
                    count,
                }))
                .concat(
                    countOccurrences < recordIds.length
                        ? [{value: null, count: recordIds.length - countOccurrences}]
                        : [],
                );
        },
        async countReverseValuesOccurrences({
            advancedLinkAttr,
            recordIds,
            ctx,
        }): Promise<IDistinctValue<ILinkBaseValue>> {
            const libCollec = dbService.db.collection(advancedLinkAttr.linked_library);
            const reverseLinkId = (advancedLinkAttr.reverse_link as IAttribute)?.id;

            const query = aql`
                FOR rec IN ${libCollec}
                    // Select each record linking to one of the recordIds
                    FILTER rec.${reverseLinkId} IN ${recordIds}

                    // Keep linked recordId to compute unlinked later
                    RETURN { recordId : rec._key, linkRecordId: rec.${reverseLinkId} }
            `;

            const res = await dbService.execute<Array<{recordId: string; linkRecordId: string}>>({
                query,
                ctx,
            });

            // Compute total occurrences to find unlinked records, each recordId without linked value counts as 1
            const countOccurrences = _.uniq(res.map(({linkRecordId}) => linkRecordId)).length;
            return res
                .map(({recordId}) => ({
                    value: {id: recordId, library: advancedLinkAttr.linked_library},
                    count: 1, // Each record can only link to one recordId, so reverse link values always have count 1
                }))
                .concat(
                    countOccurrences < recordIds.length
                        ? [{value: null, count: recordIds.length - countOccurrences}]
                        : [],
                );
        },
        async deleteAllLinkValueTo(
            library: string,
            attribute: IAttribute,
            linkedRecordId: string,
            ctx: IQueryInfos,
        ): Promise<void> {
            const libCollec = dbService.db.collection(library);

            const query = aql`
                FOR rec IN ${libCollec}
                    // Keep only record with linked value
                    FILTER rec.${attribute.id} == ${linkedRecordId}
                    
                    // Set the attribute value to null for all records linking to the given linkedRecordId
                    UPDATE rec WITH { ${attribute.id}: null } IN ${libCollec} OPTIONS { keepNull: false }
            `;

            await dbService.execute({query, ctx});
        },
        sortQueryPart({attributes, order}) {
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

            return linked.format !== AttributeFormats.EXTENDED
                ? aql`${linkedValue} ${order}`
                : aql`${_getExtendedFilterPart(attributes, linkedValue)} ${order}`;
        },
        filterValueQueryPart(attributes, filter, parentIdentifier = BASE_QUERY_IDENTIFIER) {
            const isCountFilter = filterTypesHelper.isCountFilter(filter);

            if (isCountFilter) {
                return aql`COUNT(r.${attributes[0].id}) ? 1 : 0`;
            }

            const linkedLibCollec = dbService.db.collection(attributes[0].linked_library);

            const linked = !attributes[1]
                ? {id: '_key', format: AttributeFormats.TEXT}
                : attributes[1].id === 'id'
                  ? {...attributes[1], id: '_key'}
                  : attributes[1];

            const baseIdentifier = `l${parentIdentifier}`;
            const parentIdentifierLiteral = literal(parentIdentifier);
            const baseIdentifierLiteral = literal(baseIdentifier);
            const retrieveValue = aql`FOR ${baseIdentifierLiteral} IN ${linkedLibCollec}
                    FILTER TO_STRING(${parentIdentifierLiteral}.${attributes[0].id}) == ${baseIdentifierLiteral}._key`;

            const linkedValueQueryPart = attributes[1]
                ? attributes[1]._repo.filterValueQueryPart([...attributes].splice(1), filter, baseIdentifier)
                : null;

            const linkValueIdentifier = literal(`${parentIdentifier}linkVal`);

            const returnLinkedValue = aql`
                    LET ${linkValueIdentifier} = (${linkedValueQueryPart})
                    RETURN ${linkValueIdentifier}
                `;

            const linkedValue = join([literal('FLATTEN('), retrieveValue, returnLinkedValue, literal(')')]);

            return linked.format !== AttributeFormats.EXTENDED
                ? linkedValue
                : _getExtendedFilterPart(attributes, linkedValue);
        },
        async clearAllValues(args): Promise<boolean> {
            return true;
        },
    };
}
