// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ViewInput} from '_ui/_gqlTypes';
import {mapViewTypeFromExplorerToLegacy} from '../../_constants';
import {isExplorerFilterThrough} from '../../_types';
import {IViewSettingsState} from '../store-view-settings/viewSettingsReducer';

export const prepareViewForRequest = (view: IViewSettingsState, label: Record<string, string>): ViewInput => ({
    library: view.libraryId,
    shared: false,
    display: {
        type: mapViewTypeFromExplorerToLegacy[view.viewType]
    },
    filters: view.filters.map(filter =>
        isExplorerFilterThrough(filter)
            ? {
                  field: `${filter.field}.${filter.subField}`,
                  value: filter.value,
                  condition: filter.subCondition
              }
            : {
                  field: filter.field,
                  value: filter.value,
                  condition: filter.condition
              }
    ),
    sort: view.sort.map(({field, order}) => ({field, order})),
    attributes: view.attributesIds,
    label
});
