// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
                                  ...filter.attribute
                              }
                          },
                          isPinned: pinFilters
                      }))
                : [],
        [filtersData]
    );

    return {
        filtersProps: filtersToDisplay,
        filtersData: filtersData.filters
    };
};
