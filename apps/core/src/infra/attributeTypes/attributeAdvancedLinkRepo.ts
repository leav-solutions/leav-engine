// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, AqlQuery, GeneratedAqlQuery, join, literal} from 'arangojs/aql';
import {IFilterTypesHelper} from 'infra/record/helpers/filterTypes';
import {IUtils} from 'utils/utils';
import {ILinkValue, IValueEdge} from '_types/value';
import {VALUES_LINKS_COLLECTION} from '../../infra/value/valueRepo';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import {IRecord} from '../../_types/record';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {BASE_QUERY_IDENTIFIER, IAttributeTypeRepo, IAttributeWithRevLink} from './attributeTypesRepo';
import {GetConditionPart} from './helpers/getConditionPart';

interface ISavedValueResult {
    edge: IValueEdge;
    linkedRecord: IRecord;
}

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.attributeTypes.attributeSimpleLink'?: IAttributeTypeRepo;
    'core.infra.attributeTypes.helpers.getConditionPart'?: GetConditionPart;
    'core.infra.record.helpers.filterTypes'?: IFilterTypesHelper;
    'core.utils'?: IUtils;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.attributeTypes.attributeSimpleLink': attributeSimpleLinkRepo = null,
    'core.infra.attributeTypes.helpers.getConditionPart': getConditionPart = null,
    'core.infra.record.helpers.filterTypes': filterTypes = null,
    'core.utils': utils = null
}: IDeps = {}): IAttributeTypeRepo {
    function _getExtendedFilterPart(attributes: IAttribute[], linkedValue: GeneratedAqlQuery): GeneratedAqlQuery {
        return aql`${
            attributes
                .map(a => a.id)
                .slice(2)
                .reduce((acc, value, i) => {
                    acc.push(aql`TRANSLATE(${value}, ${i ? acc[acc.length - 1] : aql`${linkedValue}`})`);
                    if (i) {
                        acc.shift();
                    }
                    return acc;
                }, [])[0]
        }`;
    }

    const _buildLinkValue = (linkedRecord: IRecord, valueEdge: IValueEdge, reverseLink: boolean): ILinkValue => {
        const recordIdField = reverseLink ? '_from' : '_to';
        const [recordLibrary, recordId] = valueEdge[recordIdField].split('/');
        return {
            id_value: valueEdge._key,
            payload: linkedRecord ? {...linkedRecord, library: recordLibrary, id: recordId} : null,
            attribute: valueEdge.attribute,
            modified_at: valueEdge.modified_at,
            modified_by: valueEdge.modified_by,
            created_at: valueEdge.created_at,
            created_by: valueEdge.created_by,
            version: valueEdge.version ?? null,
            metadata: valueEdge.metadata
        };
    };

    return {
        async createValue({library, recordId, attribute, value, ctx}): Promise<ILinkValue> {
            // If reverse_link is a simple link we call attributeSimpleLinkRepo instead.
            if ((attribute.reverse_link as IAttribute)?.type === AttributeTypes.SIMPLE_LINK) {
                await attributeSimpleLinkRepo.createValue({
                    library: attribute.linked_library,
                    recordId: value.payload,
                    attribute: {...(attribute.reverse_link as IAttribute), reverse_link: undefined},
                    value: {payload: recordId},
                    ctx
                });

                // To return the "from" value.
                return {
                    payload: {id: value.payload, library: attribute.linked_library},
                    created_by: null,
                    modified_by: null
                };
            }

            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            // Create the link between records and add some metadata on it.

            const _from = !!attribute.reverse_link
                ? attribute.linked_library + '/' + value.payload
                : library + '/' + recordId;

            const toLibrary = !!attribute.reverse_link ? library : attribute.linked_library;
            const toRecordId = !!attribute.reverse_link ? recordId : value.payload;

            const _to = toLibrary + '/' + toRecordId;

            const edgeDataAttr = !!attribute.reverse_link ? (attribute.reverse_link as IAttribute).id : attribute.id;

            const edgeData: any = {
                _from,
                _to,
                attribute: edgeDataAttr,
                modified_at: value.modified_at,
                created_at: value.created_at,
                created_by: String(ctx.userId),
                modified_by: String(ctx.userId),
                version: value.version ?? null
            };

            if (value.metadata) {
                edgeData.metadata = value.metadata;
            }

            const resEdge = await dbService.execute<ISavedValueResult[]>({
                query: aql`
                    LET linkedRecord = DOCUMENT(${toLibrary + '/' + toRecordId})
                    INSERT ${edgeData} IN ${edgeCollec}
                    RETURN {edge: NEW, linkedRecord}`,
                ctx
            });

            const savedEdge = resEdge.length ? resEdge[0] : null;
            const savedValue = !!attribute.reverse_link ? savedEdge?.edge?._from : savedEdge?.edge?._to;

            return _buildLinkValue(
                {...savedEdge?.linkedRecord, ...utils.decomposeValueEdgeDestination(savedValue)},
                savedEdge?.edge,
                !!attribute.reverse_link
            );
        },
        async updateValue({library, recordId, attribute, value, ctx}): Promise<ILinkValue> {
            // If reverse_link is a simple link we call attributeSimpleLinkRepo instead.
            if ((attribute.reverse_link as IAttribute)?.type === AttributeTypes.SIMPLE_LINK) {
                return attributeSimpleLinkRepo.updateValue({
                    library: attribute.linked_library,
                    recordId: value.payload.id,
                    attribute: {...(attribute.reverse_link as IAttribute), reverse_link: undefined},
                    value: {payload: recordId},
                    ctx
                });
            }

            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            // Update value's metadata on records link.r
            const _from = !!attribute.reverse_link
                ? attribute.linked_library + '/' + value.payload
                : library + '/' + recordId;

            const toLibrary = !!attribute.reverse_link ? library : attribute.linked_library;
            const toRecordId = !!attribute.reverse_link ? recordId : value.payload;
            const _to = toLibrary + '/' + toRecordId;

            const edgeDataAttr = !!attribute.reverse_link ? (attribute.reverse_link as IAttribute).id : attribute.id;

            const edgeData: any = {
                _from,
                _to,
                attribute: edgeDataAttr,
                modified_at: value.modified_at,
                created_by: value.created_by,
                modified_by: String(ctx.userId),
                version: value.version ?? null
            };

            if (value.metadata) {
                edgeData.metadata = value.metadata;
            }

            const resEdge = await dbService.execute<ISavedValueResult[]>({
                query: aql`
                    LET linkedRecord = DOCUMENT(${toLibrary + '/' + toRecordId})
                    UPDATE ${{_key: value.id_value}}
                        WITH ${edgeData}
                        IN ${edgeCollec}
                    RETURN {edge: NEW, linkedRecord}`,
                ctx
            });

            const savedEdge = resEdge.length ? resEdge[0] : null;
            const savedValue = !!attribute.reverse_link ? savedEdge?.edge?._from : savedEdge?.edge?._to;

            return _buildLinkValue(
                {...savedEdge?.linkedRecord, ...utils.decomposeValueEdgeDestination(savedValue)},
                savedEdge?.edge,
                !!attribute.reverse_link
            );
        },
        async deleteValue({attribute, value, ctx}): Promise<ILinkValue> {
            if ((attribute.reverse_link as IAttribute)?.type === AttributeTypes.SIMPLE_LINK) {
                return attributeSimpleLinkRepo.deleteValue({
                    library: attribute.linked_library,
                    recordId: value.payload.id,
                    attribute: {...(attribute.reverse_link as IAttribute), reverse_link: undefined},
                    value: {payload: null},
                    ctx
                });
            }

            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            // Create the link between records and add some metadata on it
            const edgeData = {
                _key: value.id_value
            };

            const resEdge = await dbService.execute<IValueEdge[]>({
                query: aql`
                    REMOVE ${edgeData} IN ${edgeCollec}
                    RETURN OLD`,
                ctx
            });
            const deletedEdge: Partial<IValueEdge> = resEdge.length ? resEdge[0] : {};

            return _buildLinkValue(
                utils.decomposeValueEdgeDestination(deletedEdge._to),
                deletedEdge as IValueEdge,
                !!attribute.reverse_link
            );
        },
        async getValues({
            library,
            recordId,
            attribute,
            forceGetAllValues = false,
            options,
            ctx
        }): Promise<ILinkValue[]> {
            // If reverse_link is a simple link we call attributeSimpleLinkRepo instead.
            if ((attribute.reverse_link as IAttribute)?.type === AttributeTypes.SIMPLE_LINK) {
                return attributeSimpleLinkRepo.getReverseValues({
                    advancedLinkAttr: attribute,
                    value: recordId,
                    forceGetAllValues,
                    ctx
                });
            }
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);
            const queryParts = [];

            const edgeAttribute = !!attribute.reverse_link ? (attribute.reverse_link as IAttribute).id : attribute.id;
            const direction = !!attribute.reverse_link ? aql`INBOUND` : aql`OUTBOUND`;

            queryParts.push(aql`
                FOR linkedRecord, edge
                    IN 1 ${direction} ${library + '/' + recordId}
                    ${edgeCollec}
                    FILTER edge.attribute == ${edgeAttribute}
                `);

            if (!forceGetAllValues && typeof options !== 'undefined' && options.version) {
                queryParts.push(aql`FILTER edge.version == ${options.version}`);
            }

            const limitOne = literal(!attribute.multiple_values && !forceGetAllValues ? 'LIMIT 1' : '');

            queryParts.push(aql`
                ${limitOne}
                RETURN {linkedRecord, edge}
            `);

            const query = join(queryParts);

            const res = await dbService.execute({query, ctx});

            return res.map(r => _buildLinkValue(dbUtils.cleanup(r.linkedRecord), r.edge, !!attribute.reverse_link));
        },
        async getValueById({library, recordId, attribute, valueId, ctx}): Promise<ILinkValue> {
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            const edgeAttribute = !!attribute.reverse_link
                ? typeof attribute.reverse_link === 'string'
                    ? attribute.reverse_link
                    : attribute.reverse_link.id
                : attribute.id;
            const direction = !!attribute.reverse_link ? aql`INBOUND` : aql`OUTBOUND`;

            const query = aql` FOR linkedRecord, edge
                    IN 1 ${direction} ${library + '/' + recordId}
                    ${edgeCollec}
                    FILTER edge._key == ${valueId}
                    FILTER edge.attribute == ${edgeAttribute}
                    LIMIT 1
                    RETURN {linkedRecord, edge}`;

            const res = await dbService.execute({query, ctx});

            if (!res.length) {
                return null;
            }

            return _buildLinkValue(dbUtils.cleanup(res[0].linkedRecord), res[0].edge, !!attribute.reverse_link);
        },
        sortQueryPart({attributes, order}: {attributes: IAttributeWithRevLink[]; order: string}): AqlQuery {
            const collec = dbService.db.collection(VALUES_LINKS_COLLECTION);
            const linked = !attributes[1]
                ? {id: '_key', format: AttributeFormats.TEXT}
                : attributes[1].id === 'id'
                  ? {...attributes[1], id: '_key'}
                  : attributes[1];

            const eAttribute = !!attributes[0].reverse_link
                ? (attributes[0].reverse_link as IAttribute)?.id
                : attributes[0].id;
            const direction = !!attributes[0].reverse_link ? aql`INBOUND` : aql`OUTBOUND`;

            let linkedValue = aql`FIRST(
                FOR v, e IN 1 ${direction} r._id
                ${collec}
                FILTER e.attribute == ${eAttribute} RETURN v.${linked.id}
            )`;

            if (attributes[0].reverse_link?.type === AttributeTypes.SIMPLE_LINK) {
                const c = dbService.db.collection(attributes[0].linked_library);
                linkedValue = aql`
                        FIRST(FOR v IN ${c}
                            FILTER v.${eAttribute} == r._key
                        RETURN v.${linked.id})
                    `;
            }

            const query =
                linked.format !== AttributeFormats.EXTENDED
                    ? aql`SORT ${linkedValue} ${order}`
                    : aql`SORT ${_getExtendedFilterPart(attributes, linkedValue)} ${order}`;

            return query;
        },
        filterValueQueryPart(attributes, filter, parentIdentifier = BASE_QUERY_IDENTIFIER) {
            const collec = dbService.db.collection(VALUES_LINKS_COLLECTION);
            const linked = !attributes[1]
                ? {id: '_key', format: AttributeFormats.TEXT}
                : attributes[1].id === 'id'
                  ? {...attributes[1], id: '_key'}
                  : attributes[1];
            const isCountFilter = filterTypes.isCountFilter(filter);
            const isReverseLink = !!attributes[0].reverse_link;
            const isReverseLinkOnSimpleLink =
                isReverseLink && attributes[0].reverse_link?.type === AttributeTypes.SIMPLE_LINK;

            const linkIdentifier = parentIdentifier + 'v';
            const vIdentifier = literal(linkIdentifier);
            const eIdentifier = literal(parentIdentifier + 'e');

            const eAttribute = isReverseLink ? (attributes[0].reverse_link as IAttribute)?.id : attributes[0].id;
            const direction = isReverseLink ? aql`INBOUND` : aql`OUTBOUND`;

            let retrieveValue: GeneratedAqlQuery;

            if (isCountFilter) {
                const countValueDirection = isReverseLink ? '_to' : '_from';
                if (isReverseLinkOnSimpleLink) {
                    const c = dbService.db.collection(attributes[0].linked_library);
                    return aql`
                        COUNT(
                            FOR ${vIdentifier} IN ${c}
                                FILTER ${vIdentifier}.${attributes[0].reverse_link.id} == ${literal(
                                    parentIdentifier
                                )}._key
                            RETURN true
                        )
                    `;
                }

                // In "count" filters, we don't need to retrieve the actual value, we just need to know how many links we have
                // Thus, using a "join" query on the edge collection is more efficient than using a traversal
                return aql`
                    COUNT(
                        FOR ${vIdentifier} IN ${collec}
                            FILTER ${vIdentifier}.${literal(countValueDirection)} == ${literal(parentIdentifier)}._id
                                AND ${vIdentifier}.attribute == ${eAttribute}
                            RETURN true
                    )
                `;
            }

            if (isReverseLinkOnSimpleLink) {
                const c = dbService.db.collection(attributes[0].linked_library);
                retrieveValue = aql`
                        FOR ${vIdentifier} IN ${c}
                            FILTER ${vIdentifier}.${attributes[0].reverse_link.id} == ${literal(
                                parentIdentifier
                            )}._key`;
            } else {
                retrieveValue = aql`
                        FOR ${vIdentifier}, ${eIdentifier} IN 1 ${direction} ${literal(parentIdentifier)}._id
                            ${collec}
                            FILTER ${eIdentifier}.attribute == ${eAttribute}
                        `;
            }

            const linkValueIdentifier = literal(`${parentIdentifier}linkVal`);
            const returnValue = aql`RETURN ${linkValueIdentifier}`;

            const linkValueQuery = attributes[1]
                ? aql`LET ${literal(linkValueIdentifier)} = (${attributes[1]._repo.filterValueQueryPart(
                      [...attributes].splice(1),
                      filter,
                      linkIdentifier
                  )})`
                : null;
            const linkedValue = join([literal('FLATTEN('), retrieveValue, linkValueQuery, returnValue, literal(')')]);

            return linked.format !== AttributeFormats.EXTENDED
                ? linkedValue
                : _getExtendedFilterPart(attributes, linkedValue);
        },
        async clearAllValues({attribute, ctx}): Promise<boolean> {
            return true;
        }
    };
}
