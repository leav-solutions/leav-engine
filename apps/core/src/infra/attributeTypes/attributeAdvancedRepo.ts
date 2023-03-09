// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, AqlQuery, GeneratedAqlQuery, join, literal} from 'arangojs/aql';
import {DocumentCollection, EdgeCollection} from 'arangojs/collection';
import {IDbUtils} from 'infra/db/dbUtils';
import {IDbDocument, IDbEdge} from 'infra/db/_types';
import {IFilterTypesHelper} from 'infra/record/helpers/filterTypes';
import {VALUES_COLLECTION, VALUES_LINKS_COLLECTION} from '../../infra/value/valueRepo';
import {AttributeFormats, IAttribute} from '../../_types/attribute';
import {IRecord, IRecordSort} from '../../_types/record';
import {IValue, IValueEdge} from '../../_types/value';
import {IDbService} from '../db/dbService';
import {BASE_QUERY_IDENTIFIER, IAttributeTypeRepo} from './attributeTypesRepo';
import {GetConditionPart} from './helpers/getConditionPart';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.attributeTypes.helpers.getConditionPart'?: GetConditionPart;
    'core.infra.record.helpers.filterTypes'?: IFilterTypesHelper;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.attributeTypes.helpers.getConditionPart': getConditionPart = null,
    'core.infra.record.helpers.filterTypes': filterTypesHelper = null
}: IDeps = {}): IAttributeTypeRepo {
    function _getExtendedFilterPart(attributes: IAttribute[], advancedValue: GeneratedAqlQuery): GeneratedAqlQuery {
        return aql`${
            attributes
                .map(a => a.id)
                .slice(1)
                .reduce((acc, value, i) => {
                    acc.push(aql`TRANSLATE(${value}, ${i ? acc[acc.length - 1] : aql`${advancedValue}`})`);
                    if (i) {
                        acc.shift();
                    }
                    return acc;
                }, [])[0]
        }`;
    }

    return {
        async createValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION);
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            // Create new value entity
            const valueData = {
                value: value.value
            };

            const resVal = await dbService.execute({
                query: aql`
                    INSERT ${valueData}
                    IN ${valCollec}
                    RETURN NEW`,
                ctx
            });
            const savedVal: Partial<IDbDocument> = resVal.length ? resVal[0] : {};

            // Create the link record<->value and add some metadata on it
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: savedVal._id,
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_at: value.created_at,
                modified_by: String(ctx.userId),
                created_by: String(ctx.userId),
                version: value.version ?? null
            };

            if (value.metadata) {
                edgeData.metadata = value.metadata;
            }

            const resEdge = await dbService.execute<IDbEdge[]>({
                query: aql`
                    INSERT ${edgeData}
                    IN ${edgeCollec}
                    RETURN NEW`,
                ctx
            });
            const savedEdge: Partial<IDbEdge> = resEdge.length ? resEdge[0] : {};

            const res: IValue = {
                id_value: savedVal._key,
                value: savedVal.value,
                attribute: savedEdge.attribute,
                modified_at: savedEdge.modified_at,
                created_at: savedEdge.created_at,
                modified_by: savedEdge.modified_by,
                created_by: savedEdge.created_by,
                metadata: savedEdge.metadata,
                version: savedEdge.version ?? null
            };

            return res;
        },
        async updateValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION);
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            // Save value entity
            const valueData = {
                value: value.value
            };

            const resVal = await dbService.execute({
                query: aql`
                    UPDATE ${{_key: value.id_value}}
                    WITH ${valueData}
                    IN ${valCollec}
                    RETURN NEW`,
                ctx
            });
            const savedVal: Partial<IDbDocument> = resVal.length ? resVal[0] : {};

            // Update value's metadata on record<->value link
            const edgeFrom = library + '/' + recordId;
            const edgeTo = savedVal._id;
            const edgeData: any = {
                _from: edgeFrom,
                _to: edgeTo,
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_at: value.created_at,
                modified_by: String(ctx.userId),
                created_by: value.created_by,
                version: value.version ?? null
            };

            if (value.metadata) {
                edgeData.metadata = value.metadata;
            }

            const resEdge = await dbService.execute<IValueEdge[]>({
                query: aql`
                    FOR e IN ${edgeCollec}
                    FILTER e._from == ${edgeFrom} AND e._to == ${edgeTo}
                    UPDATE e
                        WITH ${edgeData}
                        IN ${edgeCollec}
                    RETURN NEW`,
                ctx
            });
            const savedEdge: Partial<IValueEdge> = resEdge.length ? resEdge[0] : {};

            const res: IValue = {
                id_value: savedVal._key,
                value: savedVal.value,
                attribute: savedEdge.attribute,
                modified_at: savedEdge.modified_at,
                created_at: savedEdge.created_at,
                modified_by: savedEdge.modified_by,
                created_by: savedEdge.created_by,
                metadata: savedEdge.metadata,
                version: savedEdge.version ?? null
            };

            return res;
        },
        async deleteValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION) as DocumentCollection;
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION) as EdgeCollection<IDbEdge>;

            const deletedVal = await valCollec.remove({_key: String(value.id_value)});

            // Delete the link record<->value and add some metadata on it
            const edgeData = {
                _from: library + '/' + recordId,
                _to: deletedVal._id
            };

            const deletedEdge: IRecord = await edgeCollec.removeByExample(edgeData);

            return {
                id_value: deletedVal._key,
                attribute: deletedEdge.attribute,
                modified_at: deletedEdge.modified_at,
                created_at: deletedEdge.created_at,
                modified_by: deletedEdge.modified_by,
                created_by: deletedEdge.created_by
            };
        },
        async getValues({library, recordId, attribute, forceGetAllValues = false, options, ctx}): Promise<IValue[]> {
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            const queryParts = [
                aql`
                FOR value, edge
                IN 1 OUTBOUND ${library + '/' + recordId}
                ${edgeCollec}
                FILTER edge.attribute == ${attribute.id}
                `
            ];

            if (!forceGetAllValues && typeof options !== 'undefined' && options.version) {
                queryParts.push(aql`FILTER edge.version == ${options.version}`);
            }

            const limitOne = literal(!attribute.multiple_values && !forceGetAllValues ? 'LIMIT 1' : '');
            queryParts.push(aql`
                ${limitOne}
                RETURN {value, edge}
            `);
            const query = join(queryParts);
            const res = await dbService.execute({query, ctx});

            return res.map(r => ({
                id_value: r.value._key,
                value: r.value.value,
                attribute: r.edge.attribute,
                modified_at: r.edge.modified_at,
                created_at: r.edge.created_at,
                modified_by: r.edge.modified_by,
                created_by: r.edge.created_by,
                metadata: r.edge.metadata,
                version: r.edge.version ?? null
            }));
        },
        async getValueById({library, recordId, attribute, valueId, ctx}): Promise<IValue> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION) as DocumentCollection;
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION) as EdgeCollection<IDbEdge>;

            const query = aql`
                LET value = FIRST(FOR v IN ${valCollec}
                    FILTER v._key == ${valueId}
                RETURN v)

                FOR e IN ${edgeCollec}
                    FILTER e._to == value._id
                RETURN MERGE(e, {value: value.value})
            `;

            const valueLinks = await dbService.execute({query, ctx});

            if (!valueLinks.length) {
                return null;
            }

            return {
                id_value: valueId,
                value: valueLinks[0].value,
                attribute: valueLinks[0].attribute,
                modified_at: valueLinks[0].modified_at,
                created_at: valueLinks[0].created_at,
                modified_by: valueLinks[0].modified_by,
                created_by: valueLinks[0].created_by
            };
        },
        sortQueryPart({attributes, order}: IRecordSort): AqlQuery {
            const collec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            const advancedValue = aql`FIRST(
                FOR v, e IN 1 OUTBOUND r._id
                ${collec}
                FILTER e.attribute == ${attributes[0].id} RETURN v.value
            )`;

            const query =
                attributes[0].format === AttributeFormats.EXTENDED && attributes.length > 1
                    ? aql`SORT ${_getExtendedFilterPart(attributes, advancedValue)} ${order}`
                    : aql`SORT ${advancedValue} ${order}`;

            return query;
        },
        filterValueQueryPart(attributes, filter, parentIdentifier = BASE_QUERY_IDENTIFIER) {
            const vIdentifier = literal(parentIdentifier + 'v');
            const eIdentifier = literal(parentIdentifier + 'e');
            const collec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            const retrieveValues = aql`
                FOR ${vIdentifier}, ${eIdentifier} IN 1 OUTBOUND ${literal(parentIdentifier)}._id
                    ${collec}
                    FILTER ${eIdentifier}.attribute == ${attributes[0].id}
                    RETURN ${vIdentifier}.value
            `;

            let advancedValue: GeneratedAqlQuery;
            if (attributes[0].format === AttributeFormats.EXTENDED && attributes.length > 1) {
                advancedValue = _getExtendedFilterPart(attributes, retrieveValues);
            } else {
                advancedValue = retrieveValues;
            }

            return filterTypesHelper.isCountFilter(filter) ? aql`COUNT(${advancedValue})` : advancedValue;
        },
        async clearAllValues({attribute, ctx}): Promise<boolean> {
            return true;
        }
    };
}
