import camelCase from 'lodash/camelCase';
import {type IRecordFilterOption} from '../../../_types/record';
import {type IFilterTypesHelper} from './filterTypes';

interface IDeps {
    'core.infra.record.helpers.filterTypes'?: IFilterTypesHelper;
}

export type GetSearchVariableName = (filter: IRecordFilterOption) => string | undefined;

export default function ({
    'core.infra.record.helpers.filterTypes': filterTypesHelper = null,
}: IDeps): GetSearchVariableName {
    const {isCountFilter, isAttributeFilter, isClassifyingFilter} = filterTypesHelper;

    return filter => {
        if (isCountFilter(filter)) {
            const attributesNames = filter.attributes.map(attribute => camelCase(attribute.id));
            return `${attributesNames.join('_')}_Count`;
        } else if (isAttributeFilter(filter)) {
            const attributesNames = filter.attributes.map(attribute => camelCase(attribute.id));

            return `${attributesNames.join('_')}_Value`;
        } else if (isClassifyingFilter(filter)) {
            const treeName = camelCase(filter.treeId);

            return `classified_${treeName}_${filter.value}`;
        }
        return undefined;
    };
}
