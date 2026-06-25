import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {SortOrder} from '_ui/_gqlTypes';
import {useAttributeDetailsData, useViewSettingsContext} from './manage-view-settings-v2';
import {type FunctionComponent, type ReactNode} from 'react';
import {KitDivider, KitFilter} from 'aristid-ds';
import styled from 'styled-components';
import {CommonFilterItem} from '_ui/components/Filters/filter-items/CommonFilterItem';
import {useFilters} from '_ui/components/Filters/useFilters';
import {type UIFilter} from '../Filters';

const FilterStyled = styled(KitFilter)`
    flex: 0 0 auto;
`;

const DividerStyled = styled(KitDivider)`
    height: 26px;
    margin-inline: calc(var(--general-spacing-xxs) * 1px);
`;

export const ExplorerFiltersAndSorts: FunctionComponent<{
    isMassSelectionAll: boolean;
    showFilters: boolean;
    showSorts: boolean;
    canRemoveFilters: boolean;
    selectAllButton: ReactNode | null;
    onSortClick?: () => void;
}> = ({isMassSelectionAll, showFilters, showSorts, canRemoveFilters, selectAllButton, onSortClick}) => {
    const {t} = useSharedTranslation();

    const {view} = useViewSettingsContext();
    const {sort} = view;

    const {filtersProps} = useFilters(!canRemoveFilters);

    const {attributeDetailsById} = useAttributeDetailsData(view.libraryId);

    if (((filtersProps.length === 0 && sort.length === 0) || (!showFilters && !showSorts)) && !selectAllButton) {
        return null;
    }

    const sortValues =
        sort.length === 0
            ? undefined
            : sort.map(
                  ({field, order}) =>
                      (attributeDetailsById?.[field]?.label ?? field) +
                      ' ' +
                      (order === SortOrder.asc ? t('explorer.sort-ascending') : t('explorer.sort-descending')),
              );

    if (!Object.keys(attributeDetailsById).length) {
        return <></>;
    }

    return (
        <>
            {selectAllButton && (
                <>
                    <li>{selectAllButton}</li>
                    {((showFilters && filtersProps.length !== 0) || (showSorts && sort.length > 0)) && (
                        <DividerStyled type="vertical" />
                    )}
                </>
            )}
            {(showFilters || showSorts) && (
                <>
                    {filtersProps.length > 0 &&
                        filtersProps.map(filterProps => (
                            <li key={filterProps.key}>
                                <CommonFilterItem
                                    filter={filterProps.filter as UIFilter}
                                    isPinned={filterProps.isPinned}
                                    disabled={isMassSelectionAll}
                                />
                            </li>
                        ))}
                    {showSorts && sort.length > 0 && (
                        <li>
                            <FilterStyled
                                label={t('explorer.sort-items')}
                                values={sortValues}
                                disabled={isMassSelectionAll}
                                onClick={isMassSelectionAll ? undefined : onSortClick}
                            />
                        </li>
                    )}
                </>
            )}
        </>
    );
};
