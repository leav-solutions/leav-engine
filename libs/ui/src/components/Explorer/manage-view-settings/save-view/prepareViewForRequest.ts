import {type RecordFilterInput, type ViewInput} from '_ui/_gqlTypes';
import {mapViewTypeFromExplorerToLegacy} from '../../_constants';
import {type IViewSettingsState} from '../store-view-settings/viewSettingsReducer';
import {
    isUIFilterTree,
    isUIFilterThrough,
    isUIFilterValueList,
    type UIFilter,
    isUIFilterWithSmartFilter,
    type IUIFilterThrough,
} from '_ui/components/Filters/_types';

export const prepareViewForRequest = (
    view: IViewSettingsState,
    filters: UIFilter[],
    label: Record<string, string>,
): ViewInput => ({
    library: view.libraryId,
    shared: false,
    display: {
        type: mapViewTypeFromExplorerToLegacy[view.viewType],
    },
    filters: filters.map((filter): RecordFilterInput => {
        if (isUIFilterTree(filter)) {
            return {
                // TODO save filter.field, but need to handle Through an other way in useTransformFilters.toValidFilters to keep that field as saved
                field: filter.attribute.id,
                // TODO : save filter values as string[] when tree filter and handle fields with libraries
                value: filter.value?.[0],
                condition: filter.condition,
                withEmptyValues: filter.withEmptyValues,
            };
        }

        if (isUIFilterValueList(filter)) {
            return {
                // TODO save filter.field, but need to handle Through an other way in useTransformFilters.toValidFilters to keep that field as saved
                field: filter.attribute.id,
                // TODO : save filter values as string[] when filter and handle fields with libraries
                value: filter.value?.[0],
                condition: filter.condition,
                withEmptyValues: filter.withEmptyValues,
            };
        }

        if (isUIFilterWithSmartFilter(filter)) {
            const isThoughFilter = isUIFilterThrough(filter);
            return {
                field: isThoughFilter
                    ? `${(filter as IUIFilterThrough).field}.${(filter as IUIFilterThrough).subField}`
                    : filter.field, // We use the field here because we want to keep the full path to the attribute (ex: link_attribute.id)
                value: null, // Force no value to avoid broken load view, may be fix after LEAVC-569
                condition: isThoughFilter ? (filter as IUIFilterThrough).subCondition : filter.condition,
                withEmptyValues: filter.withEmptyValues,
            };
        }

        if (isUIFilterThrough(filter)) {
            return {
                field: `${filter.field}.${filter.subField}`,
                value: filter.value,
                condition: filter.subCondition,
            };
        }

        return {
            field: filter.field,
            value: filter.value,
            condition: filter.condition,
            withEmptyValues: filter.withEmptyValues,
        };
    }),
    sort: view.sort.map(({field, order}) => ({field, order})),
    attributes: view.attributesIds,
    label,
});
