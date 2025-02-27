// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent} from 'react';
import {KitDivider, KitFilter, KitSpace} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {SortOrder} from '_ui/_gqlTypes';
import {useViewSettingsContext} from './manage-view-settings/store-view-settings/useViewSettingsContext';
import {CommonFilterItem} from './manage-view-settings/_shared/CommonFilterItem';
import {useAttributeDetailsData} from './manage-view-settings/_shared/useAttributeDetailsData';
import {useOpenViewSettings} from './manage-view-settings';

const FilterStyled = styled(KitFilter)`
    flex: 0 0 auto;
`;

const ExplorerToolbarListStyled = styled.ul`
    padding: calc(var(--general-spacing-xs) * 1px);
    margin: 0;
    margin-bottom: calc(var(--general-spacing-s) * 1px);
    background: var(--general-colors-neutral-grey-100);
    border-radius: calc(var(--general-border-radius-s) * 1px);
    list-style: none;
    display: flex;
    overflow: auto;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0;
    white-space: nowrap;
    min-height: 26px; // height of the filter chip

    &.headless {
        margin-bottom: 0;
    }
`;

const DividerStyled = styled(KitDivider)`
    height: 2em;
`;

export const ExplorerToolbar: FunctionComponent<{
    isMassSelectionAll: boolean;
    showFiltersAndSort: boolean;
    headless: boolean;
}> = ({isMassSelectionAll, showFiltersAndSort, headless, children}) => {
    const {t} = useSharedTranslation();

    const {view} = useViewSettingsContext();
    const {filters, sort} = view;

    const {openSettingsPanel} = useOpenViewSettings({view, isEnabled: true});

    const {attributeDetailsById} = useAttributeDetailsData(view.libraryId);

    if (((filters.length === 0 && sort.length === 0) || !showFiltersAndSort) && !children) {
        return null;
    }

    const sortValues =
        sort.length === 0
            ? undefined
            : sort.map(
                  ({field, order}) =>
                      (attributeDetailsById?.[field]?.label ?? field) +
                      ' ' +
                      (order === SortOrder.asc ? t('explorer.sort-ascending') : t('explorer.sort-descending'))
              );

    const _handleClickOnSort: ComponentProps<typeof FilterStyled>['onClick'] = () =>
        isMassSelectionAll ? undefined : openSettingsPanel('sort-items');

    return (
        <ExplorerToolbarListStyled aria-label={t('explorer.toolbar')} className={headless ? 'headless' : ''}>
            {!!children && (
                <>
                    <li>{children}</li>
                    {showFiltersAndSort && (filters.length !== 0 || sort.length > 0) && (
                        <DividerStyled type="vertical" />
                    )}
                </>
            )}
            {showFiltersAndSort && (
                <KitSpace size="s">
                    {filters.length > 0 &&
                        filters.map(filter => (
                            <li key={filter.id}>
                                <CommonFilterItem key={filter.id} filter={filter} disabled={isMassSelectionAll} />
                            </li>
                        ))}
                    {sort.length > 0 && (
                        <li>
                            <FilterStyled
                                label={t('explorer.sort-items')}
                                values={sortValues}
                                disabled={isMassSelectionAll}
                                onClick={_handleClickOnSort}
                            />
                        </li>
                    )}
                </KitSpace>
            )}
        </ExplorerToolbarListStyled>
    );
};
