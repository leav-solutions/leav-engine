// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled from 'styled-components';
import {useViewSettingsContext} from '../manage-view-settings/store-view-settings/useViewSettingsContext';
import {KitButton, KitDivider, KitFilter, KitSpace} from 'aristid-ds';
import {FunctionComponent} from 'react';
import {FaTrash} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {CommonFilterItem} from '../manage-view-settings/_shared/CommonFilterItem';
import {SortOrder} from '_ui/_gqlTypes';
import {useOpenViewSettings} from '../manage-view-settings';
import {useAttributeDetailsData} from '../manage-view-settings/_shared/useAttributeDetailsData';

const FilterStyled = styled(KitFilter)`
    flex: 0 0 auto;
`;

const ExplorerToolBarListStyled = styled.ul`
    padding: calc(var(--general-spacing-xs) * 1px) calc(var(--general-spacing-xxs) * 1px)
        calc(var(--general-spacing-m) * 1px) calc(var(--general-spacing-xxs) * 1px);
    margin: 0;
    list-style: none;
    display: flex;
    overflow: auto;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0;
    white-space: nowrap;
`;

const DividerStyled = styled(KitDivider)`
    height: 2em;
`;

export const ExplorerToolBar: FunctionComponent<{
    libraryId: string;
}> = ({libraryId}) => {
    const {t} = useSharedTranslation();

    const {
        view: {filters, sort}
    } = useViewSettingsContext();

    const {openSettingsPanel} = useOpenViewSettings(libraryId);

    const {attributeDetailsById} = useAttributeDetailsData(libraryId);

    if (filters.length === 0 && sort.length === 0) {
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

    return (
        <ExplorerToolBarListStyled aria-label={t('explorer.toolbar.active')}>
            <KitSpace size="s">
                {filters.map(filter => (
                    <li key={filter.id}>
                        <CommonFilterItem key={filter.id} filter={filter} />
                    </li>
                ))}
            </KitSpace>
            {filters.length > 0 && sort.length > 0 && <DividerStyled type="vertical" />}
            {sort.length > 0 && (
                <li>
                    <FilterStyled
                        label={t('explorer.sort-items')}
                        values={sortValues}
                        onClick={() => openSettingsPanel('sort-items')}
                    />
                </li>
            )}
            <DividerStyled type="vertical" />
            <li>
                <FilterStyled as={KitButton} type="secondary" size="s" danger icon={<FaTrash />} disabled>
                    {t('explorer.reset-view')}
                </FilterStyled>
            </li>
        </ExplorerToolBarListStyled>
    );
};
