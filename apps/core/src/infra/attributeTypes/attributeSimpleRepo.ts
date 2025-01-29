// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, GeneratedAqlQuery, literal} from 'arangojs/aql';
import {IFilterTypesHelper} from 'infra/record/helpers/filterTypes';
import {IQueryInfos} from '_types/queryInfos';
import {AttributeFormats, IAttribute} from '../../_types/attribute';
import {IStandardValue, IValue} from '../../_types/value';
import {ATTRIB_COLLECTION_NAME} from '../attribute/attributeRepo';
import {IDbService} from '../db/dbService';
import {LIB_ATTRIB_COLLECTION_NAME} from '../library/libraryRepo';
import {BASE_QUERY_IDENTIFIER, IAttributeTypeRepo} from './attributeTypesRepo';
import {GetConditionPart} from './helpers/getConditionPart';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.attributeTypes.helpers.getConditionPart'?: GetConditionPart;
    'core.infra.record.helpers.filterTypes'?: IFilterTypesHelper;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.attributeTypes.helpers.getConditionPart': getConditionPart = null,
    'core.infra.record.helpers.filterTypes': filterTypesHelper = null
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
                WITH ${{[attribute.id]: value.payload}}
                IN ${collec}
                OPTIONS { keepNull: false }
                RETURN NEW`,
            ctx
        });

        const updatedDoc = res.length ? res[0] : {};

        return {
            payload: typeof updatedDoc[attribute.id] !== 'undefined' ? updatedDoc[attribute.id] : null,
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
            return _saveValue(library, recordId, attribute, {...value, payload: null}, ctx);
        },
        async isValueUnique({library, recordId, attribute, value, ctx}): Promise<boolean> {
            const query = aql`
                FOR r IN ${dbService.db.collection(library)} 
                    FILTER r._key != ${recordId} && r.${attribute.id} == ${value.payload}
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

            return res[0] !== null && res[0] !== undefined
                ? [{payload: res[0], attribute: attribute.id, modified_by: null, created_by: null}]
                : [];
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
            const libAttribCollec = dbService.db.collection(LIB_ATTRIB_COLLECTION_NAME);

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
