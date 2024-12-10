// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled from 'styled-components';
import {useViewSettingsContext} from '../manage-view-settings/store-view-settings/useViewSettingsContext';
import {KitButton, KitDivider, KitFilter, KitSpace} from 'aristid-ds';
import {FunctionComponent} from 'react';
import {FilterDropDown} from '../manage-view-settings/filter-items/filter-type/FilterDropDown';
import {FaTrash} from 'react-icons/fa';

const FilterStyled = styled(KitFilter)`
    flex: 0 0 auto;
`;

const ExplorerFilterBarStyledDiv = styled.div`
    overflow: auto;
    padding: 0 calc(var(--general-spacing-xxs) * 1px);
    padding-bottom: 20px;
`;

const ExplorerBarItemsListDiv = styled.div`
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0;
    white-space: nowrap;
    padding-top: 8px;
`;

const DividerStyled = styled(KitDivider)`
    height: 2em;
`;

interface IExplorerFilterBarProps {
    onFilterChanged?: (filter: string) => void;
}

export const ExplorerFilterBar: FunctionComponent<IExplorerFilterBarProps> = () => {
    const {
        view: {filters}
    } = useViewSettingsContext();

    const onDeleteFilter = () => false;

    return (
        <ExplorerFilterBarStyledDiv>
            <ExplorerBarItemsListDiv>
                {filters.length > 0 && (
                    <KitSpace size="s">
                        {filters.map(filter => (
                            <FilterStyled
                                key={filter.id}
                                label={filter.attribute.label}
                                expandable
                                values={filter.values}
                                dropDownProps={{
                                    placement: 'bottomLeft',
                                    dropdownRender: () => (
                                        <FilterDropDown
                                            filter={filter}
                                            attribute={filter.attribute}
                                            onDeleteFilter={onDeleteFilter}
                                        />
                                    )
                                }}
                            />
                        ))}
                    </KitSpace>
                )}
                <DividerStyled type="vertical" />
                <FilterStyled as={KitButton} type="secondary" size="s" danger icon={<FaTrash />} disabled>
                    Supprimer tous les filtres
                </FilterStyled>
            </ExplorerBarItemsListDiv>
        </ExplorerFilterBarStyledDiv>
    );
};
