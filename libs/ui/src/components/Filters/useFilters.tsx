import {useMemo} from 'react';
import {useFiltersContext} from './useFiltersContext';

export const useFilters = (pinFilters = false) => {
    const {filtersData} = useFiltersContext();

    const filtersToDisplay = useMemo(
        () =>
            filtersData && filtersData.filters
                ? filtersData.filters
                      .filter(filterItem => !filterItem.hidden)
                      .map(filter => ({
                          key: filter.id,
                          filter: {
                              ...filter,
                              attribute: {
                                  ...filtersData.attributesDataById[filter?.attribute?.id],
                                  ...filter.attribute,
                              },
                          },
                          isPinned: pinFilters,
                      }))
                : [],
        [filtersData],
    );

    return {
        filtersProps: filtersToDisplay,
        filtersData: filtersData.filters,
    };
};
