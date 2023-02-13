// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, AqlQuery, GeneratedAqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IFilterTypesHelper} from 'infra/record/helpers/filterTypes';
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
        value: savedValue.value !== null ? {id: savedValue.value, library: attribute.linked_library} : null
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
                .filter(r => !!r)
                .slice(0, 1)
                .map(r => ({
                    id_value: null,
                    library: attribute.linked_library,
                    value: dbUtils.cleanup(r),
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
            const retrieveValue = aql`FOR l IN ${linkedLibCollec}
                    FILTER TO_STRING(r.${attributes[0].id}) == l._key`;

            const linkedValueQueryPart = attributes[1]
                ? attributes[1]._repo.filterValueQueryPart([...attributes].splice(1), filter, 'l')
                : null;
            const linkValueIdentifier = aql.literal(`${parentIdentifier}linkVal`);
            const returnLinkedValue = aql`
                    LET ${linkValueIdentifier} = (${linkedValueQueryPart})
                    RETURN ${linkValueIdentifier}
                `;

            const linkedValue = aql.join([aql.literal('FLATTEN('), retrieveValue, returnLinkedValue, aql.literal(')')]);

            return linked.format !== AttributeFormats.EXTENDED
                ? linkedValue
                : _getExtendedFilterPart(attributes, linkedValue);
        },
        async clearAllValues(args): Promise<boolean> {
            return true;
        }
    };
}
