import {FilterTypes, IFilter, IFilterSeparator, IQueryFilter, operatorFilter} from '../../../_types/types';

export const getRequestFromFilter = (
    filters: (IFilter | IFilterSeparator)[],
    filterOperator: operatorFilter,
    separatorOperator: operatorFilter
): IQueryFilter[] => {
    let request: IQueryFilter[] = [];

    const hasSeparator = filters.some(filter => filter.type === FilterTypes.separator);
    const firstFilterIsFilterWithValue = filters[0].type === FilterTypes.filter && filters[0].value;

    if (hasSeparator && firstFilterIsFilterWithValue) {
        // Begin first group of filters
        request.push({operator: operatorFilter.openParent});
    }

    for (let filter of filters) {
        if (filter.type === FilterTypes.filter && filter.active && filter.value) {
            if (filter.operator) {
                request.push({operator: filterOperator});
            }
            request.push({operator: operatorFilter.openParent});

            const requestValue = handleValueRequest(filter);
            request = [...request, ...requestValue];

            request.push({operator: operatorFilter.closeParent});
        } else if (filter.type === FilterTypes.separator && firstFilterIsFilterWithValue) {
            if (
                filter.active &&
                (filters[filter.key + 1] as IFilter)?.active &&
                (filters[filter.key + 1] as IFilter)?.value
            ) {
                // Close last group
                request.push({operator: operatorFilter.closeParent});

                request.push({operator: separatorOperator});

                // Begin new group
                request.push({operator: operatorFilter.openParent});
            }
        }
    }
    if (hasSeparator && firstFilterIsFilterWithValue) {
        // Close last group
        request.push({operator: operatorFilter.closeParent});
    }

    if (!request.some(el => el.value)) {
        request = [];
    }

    return request;
};

const handleValueRequest = (filter: IFilter) => {
    const result: IQueryFilter[] = [];
    let firstValue = true;

    filter.value.split('\n').forEach(filterValue => {
        if (filterValue) {
            if (!firstValue) {
                result.push({operator: operatorFilter.or});
            }
            result.push({
                field: filter.attributeId,
                value: filterValue,
                condition: filter.condition
            });
            firstValue = false;
        }
    });

    return result;
};
