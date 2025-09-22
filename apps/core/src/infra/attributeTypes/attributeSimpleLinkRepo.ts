// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, type GeneratedAqlQuery, join, literal} from 'arangojs/aql';
import {type IDbDocument} from 'infra/db/_types';
import {type IFilterTypesHelper} from 'infra/record/helpers/filterTypes';
import {type IRecord} from '_types/record';
import {AttributeFormats, AttributeTypes, type IAttribute} from '../../_types/attribute';
import {type ILinkValue, ISaveValue} from '../../_types/value';
import {type IDbService} from '../db/dbService';
import {type IDbUtils} from '../db/dbUtils';
import {BASE_QUERY_IDENTIFIER, type IAttributeTypeRepo, IAttributeWithRevLink} from './attributeTypesRepo';
import {type GetConditionPart} from './helpers/getConditionPart';
import {type IQueryInfos} from '_types/queryInfos';
import {type IAttributeSimpleRepo} from './attributeSimpleRepo';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.attributeTypes.attributeSimple'?: IAttributeSimpleRepo;
    'core.infra.attributeTypes.helpers.getConditionPart'?: GetConditionPart;
    'core.infra.record.helpers.filterTypes'?: IFilterTypesHelper;
}

export type IAttributeSimpleLinkRepo = IAttributeTypeRepo<AttributeTypes.SIMPLE_LINK>;

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.attributeTypes.attributeSimple': attributeSimpleRepo = null,
    'core.infra.attributeTypes.helpers.getConditionPart': getConditionPart = null,
    'core.infra.record.helpers.filterTypes': filterTypesHelper = null
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
            ctx
        });

        const updatedDoc = res.length ? res[0] : null;

        const savedVal = {
            id_value: null,
            attribute: attribute.id,
            payload: updatedDoc?.doc?.[attribute.id]
                ? {...dbUtils.cleanup(updatedDoc.linkedRecord), library: attribute.linked_library}
                : null,
            created_by: null,
            modified_by: null
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
        async deleteValue(args): Promise<ILinkValue> {
            const deletedValue = await attributeSimpleRepo.deleteValue({
                ...args,
                attribute: {
                    ...args.attribute,
                    type: AttributeTypes.SIMPLE
                }
            });
            return {
                ...deletedValue,
                // deletedValue returns null payload, so override it here !
                payload: {id: args.value.payload?.id, library: args.attribute.linked_library}
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
            ctx
        }): Promise<ILinkValue[][]> {
            const libCollec = dbService.db.collection(advancedLinkAttr.linked_library);
            const query = aql`
                FOR recordId IN ${values}
                    LET records = (
                        FOR r IN ${libCollec}
                            FILTER r.${(advancedLinkAttr.reverse_link as IAttribute)?.id} == recordId
                            ${!advancedLinkAttr.multiple_values && !forceGetAllValues ? aql`LIMIT 1` : aql``}
                            RETURN r
                    )
                    RETURN { recordId: recordId, records }
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
                            modified_by: null
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
                ctx
            });

            return res
                .filter(r => !!r)
                .slice(0, 1)
                .map(r => ({
                    id_value: null,
                    payload: dbUtils.cleanup({...r, library: attribute.linked_library}),
                    attribute: attribute.id,
                    created_by: null,
                    modified_by: null
                }));
        },
        async getValuesBatch({library, recordIds, attribute, ctx}): Promise<ILinkValue[][]> {
            const libCollec = dbService.db.collection(library);
            const linkedLibCollec = dbService.db.collection(attribute.linked_library);

            const res = await dbService.execute<Array<{recordId: string; link: ILinkValue[]}>>({
                query: aql`
                    FOR recordId IN ${recordIds}
                        LET rec = DOCUMENT(${libCollec}, recordId)
                        LET link = DOCUMENT(${linkedLibCollec}, rec.${attribute.id})
                        return { recordId: recordId, link: link }
                `,
                ctx
            });

            const valuesByRecordId = new Map(res.map(r => [r.recordId, r]));
            return recordIds.map(
                recordId => {
                    const record = valuesByRecordId.get(recordId);
                    const payload = record.link;
                    return payload !== null && payload !== undefined
                        ? [
                              {
                                  id_value: null,
                                  payload: dbUtils.cleanup({...payload, library: attribute.linked_library}),
                                  attribute: attribute.id,
                                  modified_by: null,
                                  created_by: null
                              }
                          ]
                        : [];
                },
                {} as Record<string, ILinkValue[]>
            );
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
            const baseIdentifierLiteral = literal(baseIdentifier);
            const retrieveValue = aql`FOR ${baseIdentifierLiteral} IN ${linkedLibCollec}
                    FILTER TO_STRING(r.${attributes[0].id}) == ${baseIdentifierLiteral}._key`;

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
        }
    };
}
