import {FilterTypes, IFilter, IFilterSeparator, IQueryFilter, OperatorFilter} from '../../../_types/types';
import {AttributeFormat} from './../../../_types/types';

export const getRequestFromFilter = (
    filters: (IFilter | IFilterSeparator)[],
    filterOperator: OperatorFilter,
    separatorOperator: OperatorFilter
): IQueryFilter[] => {
    let request: IQueryFilter[] = [];

    const hasSeparator = filters.some(filter => filter.type === FilterTypes.separator);
    const firstFilterIsFilterWithValue = filters[0].type === FilterTypes.filter && filters[0].value;

    if (hasSeparator && firstFilterIsFilterWithValue) {
        // Begin first group of filters
        request.push({operator: OperatorFilter.openParent});
    }

    for (let filter of filters) {
        if (filter.type === FilterTypes.filter && filter.active && filter.value) {
            if (filter.operator) {
                request.push({operator: filterOperator});
            }
            request.push({operator: OperatorFilter.openParent});

            const requestValue = handleValueRequest(filter);
            request = [...request, ...requestValue];

            request.push({operator: OperatorFilter.closeParent});
        } else if (filter.type === FilterTypes.separator && firstFilterIsFilterWithValue) {
            if (
                filter.active &&
                (filters[filter.key + 1] as IFilter)?.active &&
                (filters[filter.key + 1] as IFilter)?.value
            ) {
                // Close last group
                request.push({operator: OperatorFilter.closeParent});

                request.push({operator: separatorOperator});

                // Begin new group
                request.push({operator: OperatorFilter.openParent});
            }
        }
    }
    if (hasSeparator && firstFilterIsFilterWithValue) {
        // Close last group
        request.push({operator: OperatorFilter.closeParent});
    }

    if (!request.some(el => el.value)) {
        request = [];
    }

    return request;
};

const handleValueRequest = (filter: IFilter) => {
    const result: IQueryFilter[] = [];
    let firstValue = true;

    switch (filter.format) {
        case AttributeFormat.text: {
            filter.value.split('\n').forEach(filterValue => {
                if (filterValue) {
                    if (!firstValue) {
                        result.push({operator: OperatorFilter.or});
                    }

                    result.push({
                        field: getValueFromFilter(filter),
                        value: filterValue,
                        condition: filter.condition
                    });
                    firstValue = false;
                }
            });
            break;
        }
        case AttributeFormat.boolean: {
            result.push({
                field: filter.attributeId,
                value: filter.value,
                condition: filter.condition
            });
            break;
        }
    }

    return result;
};

const getValueFromFilter = (filter: IFilter) => {
    if (filter.originAttributeData) {
        return `${filter.originAttributeData.id}.${filter.attributeId}`;
    }
    if (filter.extendedData) {
        return `${filter.extendedData.path}`;
    }
    return `${filter.attributeId}`;
};
