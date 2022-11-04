// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {GeneratedAqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IAttributeTypesRepo} from 'infra/attributeTypes/attributeTypesRepo';
import {IRecordFilterOption} from '../../../_types/record';
import {IFilterTypesHelper} from './filterTypes';
import {GetClassifyingFiltersVariableQueryPart} from './getClassifyingFiltersVariableQueryPart';
import {GetSearchVariableName} from './getSearchVariableName';

interface IDeps {
    'core.infra.attributeTypes'?: IAttributeTypesRepo;
    'core.infra.record.helpers.getClassifyingFiltersVariableQueryPart'?: GetClassifyingFiltersVariableQueryPart;
    'core.infra.record.helpers.getSearchVariableName'?: GetSearchVariableName;
    'core.infra.record.helpers.filterTypes'?: IFilterTypesHelper;
}

export type GetSearchVariablesQueryPart = (filters: IRecordFilterOption[]) => GeneratedAqlQuery[];

export default function ({
    'core.infra.attributeTypes': attributeTypes = null,
    'core.infra.record.helpers.getClassifyingFiltersVariableQueryPart': getClassifyingFiltersVariableQueryPart = null,
    'core.infra.record.helpers.getSearchVariableName': getSearchVariableName = null,
    'core.infra.record.helpers.filterTypes': filterTypesHelper = null
}: IDeps): GetSearchVariablesQueryPart {
    const {isAttributeFilter, isClassifyingFilter} = filterTypesHelper;

    return filters => {
        const queryPartsById: {[id: string]: GeneratedAqlQuery} = {};

        const variablesDeclarations = filters.reduce((acc, filter): GeneratedAqlQuery[] => {
            if (!isAttributeFilter(filter) && !isClassifyingFilter(filter)) {
                return acc;
            }

            const variableName = getSearchVariableName(filter);
            if (typeof queryPartsById[variableName] !== 'undefined') {
                return acc;
            }

            let variablePart;
            if (isAttributeFilter(filter)) {
                const lastQueryAttribute = filter.attributes[0];
                const typeRepo = attributeTypes.getTypeRepo(lastQueryAttribute);

                variablePart = typeRepo.filterValueQueryPart(
                    filter.attributes.map(attr => ({...attr, _repo: attributeTypes.getTypeRepo(attr)})),
                    filter
                );
            } else if (isClassifyingFilter(filter)) {
                variablePart = getClassifyingFiltersVariableQueryPart(filter);
            }

            queryPartsById[variableName] = variablePart;
            acc.push(aql`LET ${aql.literal(variableName)} = (${variablePart})`);

            return acc;
        }, []);

        return variablesDeclarations;
    };
}
