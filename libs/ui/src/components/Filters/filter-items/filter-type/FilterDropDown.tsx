// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent, useRef} from 'react';
import styled from 'styled-components';
import {KitDivider, KitButton} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FilterDropdownContent} from './FilterDropdownContent';
import {useFiltersContext} from '../../useFiltersContext';
import {FiltersActionTypes} from '../../context/filtersReducer';
import {type IUIFilterDropDownProps, type UIFilter} from '../../_types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faClock, faTrash} from '@fortawesome/free-solid-svg-icons';

const FilterDropDownStyledDiv = styled.div`
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-xxs) * 1px);
`;

export const FilterDropDown: FunctionComponent<IUIFilterDropDownProps> = ({filter, canRemove}) => {
    const {t} = useSharedTranslation();
    const {dispatch} = useFiltersContext();
    const selectDropDownRef = useRef<HTMLDivElement>(null);

    const onFilterChange: ComponentProps<typeof FilterDropdownContent>['onFilterChange'] = (filterData: UIFilter) =>
        dispatch({
            type: FiltersActionTypes.CHANGE_FILTER_CONFIG,
            payload: filterData,
        });

    const _onResetFilter: ComponentProps<typeof KitButton>['onClick'] = () =>
        dispatch({
            type: FiltersActionTypes.RESET_FILTER,
            payload: {
                id: filter.id,
            },
        });

    const _onDeleteFilter: ComponentProps<typeof KitButton>['onClick'] = () =>
        dispatch({
            type: FiltersActionTypes.REMOVE_FILTER,
            payload: {
                id: filter.id,
            },
        });

    return (
        <FilterDropDownStyledDiv>
            <FilterDropdownContent
                filter={filter}
                onFilterChange={onFilterChange}
                selectDropDownRef={selectDropDownRef}
            />
            <div ref={selectDropDownRef} />
            <KitDivider noMargin />
            <KitButton type="action" icon={<FontAwesomeIcon icon={faClock} />} onClick={_onResetFilter}>
                {t('explorer.reset-filter')}
            </KitButton>
            {canRemove && (
                <KitButton type="action" icon={<FontAwesomeIcon icon={faTrash} />} onClick={_onDeleteFilter}>
                    {t('global.delete')}
                </KitButton>
            )}
        </FilterDropDownStyledDiv>
    );
};
