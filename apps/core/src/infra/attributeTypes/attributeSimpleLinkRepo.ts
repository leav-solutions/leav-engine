// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, AqlQuery, GeneratedAqlQuery, join, literal} from 'arangojs/aql';
import {IDbDocument} from 'infra/db/_types';
import {IFilterTypesHelper} from 'infra/record/helpers/filterTypes';
import {IRecord} from '_types/record';
import {AttributeFormats, IAttribute} from '../../_types/attribute';
import {ILinkValue, IStandardValue} from '../../_types/value';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {BASE_QUERY_IDENTIFIER, IAttributeTypeRepo} from './attributeTypesRepo';
import {GetConditionPart} from './helpers/getConditionPart';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.attributeTypes.attributeSimple'?: IAttributeTypeRepo;
    'core.infra.attributeTypes.helpers.getConditionPart'?: GetConditionPart;
    'core.infra.record.helpers.filterTypes'?: IFilterTypesHelper;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.attributeTypes.attributeSimple': attributeSimpleRepo = null,
    'core.infra.attributeTypes.helpers.getConditionPart': getConditionPart = null,
    'core.infra.record.helpers.filterTypes': filterTypesHelper = null
}: IDeps = {}): IAttributeTypeRepo {
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

    const _buildLinkValue = (savedValue: IStandardValue, attribute: IAttribute): ILinkValue => ({
        ...savedValue,
        payload: savedValue.payload !== null ? {id: savedValue.payload, library: attribute.linked_library} : null
    });

    const _saveValue: IAttributeTypeRepo['createValue'] = async ({library, recordId, attribute, value, ctx}) => {
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

            const limitOne = literal(!advancedLinkAttr.multiple_values && !forceGetAllValues ? 'LIMIT 1' : '');

            queryParts.push(aql`
                ${limitOne}
                RETURN r
            `);

            const query = join(queryParts);
            const res = await dbService.execute({query, ctx});

            return res.map(r => ({id_value: null, payload: dbUtils.cleanup(r), created_by: null, modified_by: null}));
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
                    library: attribute.linked_library,
                    payload: dbUtils.cleanup({...r, library: attribute.linked_library}),
                    created_by: null,
                    modified_by: null
                }));
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
