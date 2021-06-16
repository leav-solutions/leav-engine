// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, AqlQuery, GeneratedAqlQuery} from 'arangojs/lib/cjs/aql-query';
import {AttributeFormats, IAttribute} from '../../_types/attribute';
import {IRecordSort} from '../../_types/record';
import {ILinkValue, IStandardValue} from '../../_types/value';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {IAttributeTypeRepo} from './attributeTypesRepo';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.attributeTypes.attributeSimple'?: IAttributeTypeRepo;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.attributeTypes.attributeSimple': attributeSimpleRepo = null
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
        async getValueById(): Promise<ILinkValue> {
            return null;
        },
        sortQueryPart({attributes, order}: IRecordSort): AqlQuery {
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
        filterQueryPart(attributes: IAttribute[], queryPart: GeneratedAqlQuery, index?: number): AqlQuery {
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
                    ? aql`FILTER ${linkedValue} ${queryPart}`
                    : aql`FILTER ${_getExtendedFilterPart(attributes, linkedValue)} ${queryPart}`;

            return query;
        },
        async clearAllValues(args): Promise<boolean> {
            return true;
        }
    };
}
