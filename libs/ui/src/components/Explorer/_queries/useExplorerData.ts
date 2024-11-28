// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {IExplorerData} from '../_types';
import {ExplorerQuery, SortOrder, useExplorerQuery} from '_ui/_gqlTypes';
import {useLang} from '_ui/hooks';

const _mapping = (data: ExplorerQuery, libraryId: string, availableLangs: string[]): IExplorerData => {
    const attributes = data.records.list.length
        ? data.records.list[0].properties.reduce((acc, property) => {
              acc[property.attributeId] = {
                  ...property.attributeProperties,
                  label: localizedTranslation(property.attributeProperties.label, availableLangs)
              };

              return acc;
          }, {})
        : {};

    const records = data.records.list.map(({whoAmI, properties}) => ({
        libraryId,
        key: whoAmI.id, // For <KitTable /> only
        itemId: whoAmI.id, // For <KitTable /> only
        whoAmI: {
            label: null,
            subLabel: null,
            color: null,
            preview: null,
            ...whoAmI
        },
        propertiesById: properties.reduce((acc, {attributeId, values}) => ({...acc, [attributeId]: values}), {})
    }));

    return {
        attributes,
        records
    };
};

export const useExplorerData = ({
    libraryId,
    attributeIds,
    sorts
}: {
    libraryId: string;
    attributeIds: string[];
    sorts: Array<{
        attributeId: string;
        order: SortOrder;
    }>;
}) => {
    const {lang: availableLangs} = useLang();
    const {data, loading, refetch} = useExplorerQuery({
        variables: {
            libraryId,
            attributeIds,
            multipleSort: sorts.map(({order, attributeId}) => ({
                field: attributeId,
                order
            }))
        }
    });

    return {
        data: data !== undefined ? _mapping(data, libraryId, availableLangs) : null,
        loading,
        refetch
    };
};
