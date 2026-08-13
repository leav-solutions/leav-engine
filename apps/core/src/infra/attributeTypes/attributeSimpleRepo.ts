import {aql, type GeneratedAqlQuery, join, literal} from 'arangojs/aql';
import {type IFilterTypesHelper} from '../record/helpers/filterTypes';
import {type IQueryInfos} from '../../_types/queryInfos';
import {AttributeFormats, type AttributeTypes, type IAttribute} from '../../_types/attribute';
import {
    type IDistinctValue,
    type IStandardBaseValue,
    type ISaveStandardValue,
    type IStandardValue,
} from '../../_types/value';
import {ATTRIB_COLLECTION_NAME} from '../attribute/attributeRepo';
import {type IDbService} from '../db/dbService';
import {LIB_ATTRIB_COLLECTION_NAME} from '../library/libraryRepo';
import {BASE_QUERY_IDENTIFIER, type IAttributeTypeRepo} from './attributeTypesRepo';
import _ from 'lodash';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.record.helpers.filterTypes'?: IFilterTypesHelper;
}

export type IAttributeSimpleRepo = IAttributeTypeRepo<AttributeTypes.SIMPLE>;

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.record.helpers.filterTypes': filterTypesHelper = null,
}: IDeps = {}): IAttributeSimpleRepo {
    async function _saveValue(
        library: string,
        recordId: string,
        attribute: IAttribute,
        value: ISaveStandardValue,
        ctx: IQueryInfos,
    ): Promise<IStandardValue> {
        const collec = dbService.db.collection(library);
        const isValueDeleted = value.payload === null;
        // For extended format we don't want to merge object with previous value
        // because we are not able to do partial updates on extended attributes.
        const mergeObjects = attribute.format !== AttributeFormats.EXTENDED;

        const res = await dbService.execute({
            query: aql`
                UPDATE ${{_key: recordId}}
                WITH ${{[attribute.id]: value.payload}}
                IN ${collec}
                OPTIONS { keepNull: false, mergeObjects: ${mergeObjects} }
                RETURN ${literal(isValueDeleted ? 'OLD' : 'NEW')}
            `,
            ctx,
        });

        const updatedDoc = res.length ? res[0] : {};

        return {
            payload: typeof updatedDoc[attribute.id] !== 'undefined' ? updatedDoc[attribute.id] : null,
            attribute: attribute.id,
            created_by: null,
            modified_by: null,
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
        async deleteValue({library, recordId, attribute, value, ctx}): Promise<IStandardValue | null> {
            return _saveValue(library, recordId, attribute, {...value, payload: null}, ctx);
        },
        async isValueUsed({library, excludedRecordId, attribute, value, ctx}): Promise<boolean> {
            const queryParts = [
                aql`FOR r IN ${dbService.db.collection(library)} 
                        FILTER r.${attribute.id} == ${value.payload}`,
            ];

            if (excludedRecordId) {
                queryParts.push(aql`FILTER r._key != ${excludedRecordId}`);
            }

            queryParts.push(aql`RETURN r._key`);
            const query = join(queryParts);

            const res = await dbService.execute({query, ctx});

            return res.length > 0;
        },
        async getValuesBatch({library, recordIds, attribute, ctx}): Promise<IStandardValue[][]> {
            const coll = dbService.db.collection(library);
            const query = aql`
                FOR r IN ${coll}
                    FILTER r._key IN ${recordIds}
                    RETURN { recordId: r._key, ${attribute.id}: r.${attribute.id} }
            `;
            const res = await dbService.execute<Array<{recordId: string; [k: string]: any}>>({query, ctx});
            const valuesByRecordId = new Map(res.map(r => [r.recordId, r]));
            return recordIds.map(recordId => {
                const record = valuesByRecordId.get(recordId);
                const payload = record?.[attribute.id];
                return payload != null ? [{payload, attribute: attribute.id, modified_by: null, created_by: null}] : [];
            });
        },
        async listDistinctValues({library, attribute, recordIds, ctx}): Promise<IDistinctValue<IStandardBaseValue>> {
            const libCollec = dbService.db.collection(library);

            // For all recordIds, retrieve the value and count the occurrences of each linked value
            const query = aql`
                FOR rec IN ${libCollec}
                    FILTER rec._key IN ${recordIds}

                    // Keep only record with linked value
                    LET value = rec.${attribute.id}
                    
                    // Group by linkedId and count occurrences
                    COLLECT valueGrouped = value WITH COUNT INTO count
                    RETURN { value: valueGrouped, count }
            `;

            const res = await dbService.execute<Array<{value: any; count: number}>>({query, ctx});

            // Compute total occurrences to find unlinked records, each recordId without linked value counts as 1
            const countOccurrences = _.sum(res.map(r => r.count));

            return res.concat(
                countOccurrences < recordIds.length ? [{value: null, count: recordIds.length - countOccurrences}] : [],
            );
        },
        sortQueryPart({attributes, order}) {
            attributes[0].id = attributes[0].id === 'id' ? '_key' : attributes[0].id;

            return attributes[0].format === AttributeFormats.EXTENDED && attributes.length > 1
                ? aql`${_getExtendedFilterPart(attributes)} ${order}`
                : aql`r.${attributes[0].id} ${order}`;
        },
        filterValueQueryPart(attributes, filter, parentIdentifier = BASE_QUERY_IDENTIFIER) {
            let recordValue: GeneratedAqlQuery;
            if (attributes[0].format === AttributeFormats.EXTENDED && attributes.length > 1) {
                recordValue = _getExtendedFilterPart(attributes);
            } else {
                const attributeId = attributes[0].id === 'id' ? '_key' : attributes[0].id;
                recordValue = aql`${literal(parentIdentifier)}.${attributeId}`;
            }

            return filterTypesHelper.isCountFilter(filter) ? aql`COUNT(${recordValue}) ? 1 : 0` : recordValue;
        },
        async clearAllValues({attribute, ctx}): Promise<boolean> {
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
        },
    };
}
