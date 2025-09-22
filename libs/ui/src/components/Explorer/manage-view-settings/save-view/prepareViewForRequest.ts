// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type RecordFilterInput, type ViewInput} from '_ui/_gqlTypes';
import {mapViewTypeFromExplorerToLegacy} from '../../_constants';
import {isExplorerFilterThrough, isExplorerFilterTree, isExplorerFilterValueList} from '../../_types';
import {type IViewSettingsState} from '../store-view-settings/viewSettingsReducer';

export const prepareViewForRequest = (view: IViewSettingsState, label: Record<string, string>): ViewInput => ({
    library: view.libraryId,
    shared: false,
    display: {
        type: mapViewTypeFromExplorerToLegacy[view.viewType]
    },
    filters: view.filters.map((filter): RecordFilterInput => {
        if (isExplorerFilterTree(filter)) {
            return {
                // TODO save filter.field, but need to handle Through an other way in useTransformFilters.toValidFilters to keep that field as saved
                field: filter.attribute.id,
                // TODO : save filter values as string[] when tree filter and handle fields with libraries
                value: filter.value?.[0],
                condition: filter.condition
            };
        }
        if (isExplorerFilterThrough(filter)) {
            return {
                field: `${filter.field}.${filter.subField}`,
                value: filter.value,
                condition: filter.subCondition
            };
        }

        if (isExplorerFilterValueList(filter)) {
            return {
                // TODO save filter.field, but need to handle Through an other way in useTransformFilters.toValidFilters to keep that field as saved
                field: filter.attribute.id,
                // TODO : save filter values as string[] when filter and handle fields with libraries
                value: filter.value?.[0],
                condition: filter.condition
            };
        }

        return {
            field: filter.field,
            value: filter.value,
            condition: filter.condition
        };
    }),
    sort: view.sort.map(({field, order}) => ({field, order})),
    attributes: view.attributesIds,
    label
});
