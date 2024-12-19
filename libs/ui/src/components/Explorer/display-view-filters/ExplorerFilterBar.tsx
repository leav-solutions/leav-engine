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

const FilterStyled = styled(KitFilter)`
    flex: 0 0 auto;
`;

const ExplorerFilterBarListStyled = styled.ul`
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

export const ExplorerFilterBar: FunctionComponent = () => {
    const {t} = useSharedTranslation();

    const {
        view: {filters}
    } = useViewSettingsContext();

    if (filters.length === 0) {
        return null;
    }

    return (
        <ExplorerFilterBarListStyled aria-label={t('explorer.filter-list.active')}>
            <KitSpace size="s">
                {filters.map(filter => (
                    <li key={filter.id}>
                        <CommonFilterItem key={filter.id} filter={filter} />
                    </li>
                ))}
            </KitSpace>
            <DividerStyled type="vertical" />
            <li>
                <FilterStyled as={KitButton} type="secondary" size="s" danger icon={<FaTrash />} disabled>
                    {t('explorer.delete-filters')}
                </FilterStyled>
            </li>
        </ExplorerFilterBarListStyled>
    );
};
