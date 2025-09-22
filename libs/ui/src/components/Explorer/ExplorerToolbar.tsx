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
import {ExplorerFilter} from './_types';

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
    gap: calc(var(--general-spacing-xxs) * 1px);
    white-space: nowrap;
    min-height: 26px; // height of the filter chip
    width: 100%;

    display: flex;
    flex-wrap: wrap;
    align-items: center;
    align-self: center;

    &.headless {
        margin-bottom: 0;
    }
`;

const DividerStyled = styled(KitDivider)`
    height: 26px;
    margin-inline: calc(var(--general-spacing-xxs) * 1px);
`;

export const ExplorerToolbar: FunctionComponent<{
    isMassSelectionAll: boolean;
    showFilters: boolean;
    showSorts: boolean;
    headless: boolean;
}> = ({isMassSelectionAll, showFilters, showSorts, headless, children}) => {
    const {t} = useSharedTranslation();

    const {view} = useViewSettingsContext();
    const {filters, sort} = view;

    const {openSettingsPanel} = useOpenViewSettings({view, isEnabled: true});

    const {attributeDetailsById} = useAttributeDetailsData(view.libraryId);
    const visibleFilters = filters.filter(filterItem => !filterItem.hidden);

    if (((visibleFilters.length === 0 && sort.length === 0) || (!showFilters && !showSorts)) && !children) {
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

    if (!Object.keys(attributeDetailsById).length) {
        return <></>;
    }

    return (
        <ExplorerToolbarListStyled aria-label={t('explorer.toolbar')} className={headless ? 'headless' : ''}>
            {!!children && (
                <>
                    <li>{children}</li>
                    {((showFilters && visibleFilters.length !== 0) || (showSorts && sort.length > 0)) && (
                        <DividerStyled type="vertical" />
                    )}
                </>
            )}
            {(showFilters || showSorts) && (
                <>
                    {visibleFilters.length > 0 &&
                        visibleFilters.map(filter => (
                            <li key={filter.id}>
                                <CommonFilterItem
                                    key={filter.id}
                                    filter={
                                        {
                                            ...filter,
                                            attribute: {
                                                ...attributeDetailsById[filter?.attribute?.id],
                                                ...filter.attribute
                                            }
                                        } as ExplorerFilter
                                    }
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
        </ExplorerToolbarListStyled>
    );
};
