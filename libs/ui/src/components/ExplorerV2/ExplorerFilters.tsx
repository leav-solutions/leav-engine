import {type FunctionComponent, type ReactNode} from 'react';
import {KitDivider} from 'aristid-ds';
import styled from 'styled-components';
import {CommonFilterItem} from '_ui/components/Filters/filter-items/CommonFilterItem';
import {useFilters} from '_ui/components/Filters/useFilters';
import {type UIFilter} from '../Filters';

const DividerStyled = styled(KitDivider)`
    height: 26px;
    margin-inline: calc(var(--general-spacing-xxs) * 1px);
`;

export const ExplorerFilters: FunctionComponent<{
    isMassSelectionAll: boolean;
    showFilters: boolean;
    pinnedFilterIds: Set<string>;
    canRemoveFilters: boolean;
    selectAllButton: ReactNode | null;
}> = ({isMassSelectionAll, showFilters, pinnedFilterIds, canRemoveFilters, selectAllButton}) => {
    const {filtersProps: allFiltersProps} = useFilters(!canRemoveFilters);
    // An unpinned filter still applies to the request (see `Explorer.tsx`'s `requestFilters`) but must not
    // show as a toolbar chip.
    const filtersProps = allFiltersProps.filter(filterProps => pinnedFilterIds.has(filterProps.key));

    if ((filtersProps.length === 0 || !showFilters) && !selectAllButton) {
        return null;
    }

    return (
        <>
            {selectAllButton && (
                <>
                    <li>{selectAllButton}</li>
                    {showFilters && filtersProps.length !== 0 && <DividerStyled vertical />}
                </>
            )}
            {showFilters && (
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
                </>
            )}
        </>
    );
};
