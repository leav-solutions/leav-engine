import {localizedTranslation} from '@leav/utils';
import {type ExplorerLibraryDataQuery} from '_ui/_gqlTypes';
import {type IExplorerData} from '../_types';

/**
 * Maps an ExplorerLibraryData response to the explorer data shape. Shared by `useExplorerData`
 * (single paginated set) and the kanban per-column loading (one response per column page), so both
 * produce strictly identical records.
 */
export const mapLibraryDataToExplorerData = (
    data: ExplorerLibraryDataQuery,
    libraryId: string,
    availableLangs: string[],
): IExplorerData => {
    const attributes = data.records.list.length
        ? data.records.list[0].properties.reduce((acc, property) => {
              acc[property.attributeId] = {
                  ...property.attributeProperties,
                  label: localizedTranslation(property.attributeProperties.label, availableLangs),
              };

              return acc;
          }, {})
        : {};

    const records = data.records.list.map(({whoAmI, active, permissions, properties}) => ({
        libraryId,
        key: whoAmI.id, // For <KitTable /> only
        itemId: whoAmI.id, // For <KitTable /> only
        active,
        canActivate: permissions.create_record,
        canDelete: permissions.delete_record,
        whoAmI: {
            label: null,
            subLabel: null,
            color: null,
            preview: null,
            ...whoAmI,
        },
        propertiesById: properties.reduce((acc, {attributeId, values}) => ({...acc, [attributeId]: values}), {}),
    }));

    return {
        totalCount: data.records.totalCount ?? 0,
        attributes,
        records,
    };
};
