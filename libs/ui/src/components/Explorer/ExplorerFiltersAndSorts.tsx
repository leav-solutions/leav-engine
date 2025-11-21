// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {SortOrder} from '_ui/_gqlTypes';
import {useViewSettingsContext} from './manage-view-settings/store-view-settings/useViewSettingsContext';
import {useAttributeDetailsData} from './manage-view-settings/_shared/useAttributeDetailsData';
import {useOpenViewSettings} from './manage-view-settings';
import {type ComponentProps, type FunctionComponent, type ReactNode} from 'react';
import {KitDivider, KitFilter} from 'aristid-ds';
import styled from 'styled-components';
import {CommonFilterItem, type ICommonFilterProps} from '_ui/components/Filters/filter-items/CommonFilterItem';
import {useFilters} from '_ui/components/Filters/useFilters';

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
}> = ({isMassSelectionAll, showFilters, showSorts, canRemoveFilters, selectAllButton}) => {
    const {t} = useSharedTranslation();

    const {view} = useViewSettingsContext();
    const {sort} = view;

    const {openSettingsPanel} = useOpenViewSettings({view, isEnabled: true});
    const {filtersProps} = useFilters(!canRemoveFilters);

    const {attributeDetailsById} = useAttributeDetailsData(view.libraryId);
    // const visibleFilters = filters.filter(filterItem => !filterItem.hidden);

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

    const _handleClickOnSort: ComponentProps<typeof FilterStyled>['onClick'] = () =>
        isMassSelectionAll ? undefined : openSettingsPanel('sort-items');

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
                                    {...(filterProps as ICommonFilterProps)}
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
                                onClick={_handleClickOnSort}
                            />
                        </li>
                    )}
                </>
            )}
        </>
    );
};
