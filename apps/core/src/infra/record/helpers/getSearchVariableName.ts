// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import camelCase from 'lodash/camelCase';
import {IRecordFilterOption} from '../../../_types/record';
import {IFilterTypesHelper} from './filterTypes';

interface IDeps {
    'core.infra.record.helpers.filterTypes'?: IFilterTypesHelper;
}

export type GetSearchVariableName = (filter: IRecordFilterOption) => string;

export default function ({
    'core.infra.record.helpers.filterTypes': filterTypesHelper = null
}: IDeps): GetSearchVariableName {
    const {isAttributeFilter, isClassifyingFilter} = filterTypesHelper;

    return filter => {
        if (isAttributeFilter(filter)) {
            const attributesNames = filter.attributes.map(attribute => camelCase(attribute.id));

            return `${attributesNames.join('_')}_Value`;
        } else if (isClassifyingFilter(filter)) {
            const treeName = camelCase(filter.treeId);

            return `classified_${treeName}_${filter.value}`;
        }
    };
}
