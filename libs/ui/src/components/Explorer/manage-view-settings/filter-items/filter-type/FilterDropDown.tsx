// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent, useRef} from 'react';
import {FaClock, FaTrash} from 'react-icons/fa';
import styled from 'styled-components';
import {KitDivider, KitButton} from 'aristid-ds';
import {ExplorerFilter, IFilterDropDownProps} from '../../../_types';
import {ViewSettingsActionTypes} from '../../store-view-settings/viewSettingsReducer';
import {useViewSettingsContext} from '../../store-view-settings/useViewSettingsContext';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FilterDropdownContent} from './FilterDropdownContent';

const FilterDropDownStyledDiv = styled.div`
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-xxs) * 1px);
`;

export const FilterDropDown: FunctionComponent<IFilterDropDownProps> = ({filter}) => {
    const {t} = useSharedTranslation();
    const {dispatch} = useViewSettingsContext();
    const selectDropDownRef = useRef<HTMLDivElement>(null);

    const onFilterChange: ComponentProps<typeof FilterDropdownContent>['onFilterChange'] = (
        filterData: ExplorerFilter
    ) =>
        dispatch({
            type: ViewSettingsActionTypes.CHANGE_FILTER_CONFIG,
            payload: filterData
        });

    const _onResetFilter: ComponentProps<typeof KitButton>['onClick'] = () =>
        dispatch({
            type: ViewSettingsActionTypes.RESET_FILTER,
            payload: {
                id: filter.id
            }
        });

    const _onDeleteFilter: ComponentProps<typeof KitButton>['onClick'] = () =>
        dispatch({
            type: ViewSettingsActionTypes.REMOVE_FILTER,
            payload: {
                id: filter.id
            }
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
            <KitButton type="redirect" icon={<FaClock />} onClick={_onResetFilter}>
                {t('explorer.reset-filter')}
            </KitButton>
            <KitButton type="redirect" icon={<FaTrash />} onClick={_onDeleteFilter}>
                {t('global.delete')}
            </KitButton>
        </FilterDropDownStyledDiv>
    );
};
