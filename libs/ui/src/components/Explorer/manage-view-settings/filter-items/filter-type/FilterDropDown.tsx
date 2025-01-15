// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent} from 'react';
import {FaClock, FaTrash} from 'react-icons/fa';
import styled from 'styled-components';
import {KitDivider, KitButton} from 'aristid-ds';
import {AttributeFormat} from '_ui/_gqlTypes';
import {IExplorerFilter, IFilterDropDownProps} from '_ui/components/Explorer/_types';
import {TextAttributeDropDown} from './TextAttributeDropDown';
import {NumericAttributeDropDown} from './NumericAttributeDropDown';
import {BooleanAttributeDropDown} from './BooleanAttributeDropdown';
import {DateAttributeDropDown} from './DateAttributeDropDown';
import {EncryptedAttributeDropDown} from './EncryptedAttributeDropDown';
import {ExtendedAttributeDropDown} from './ExtendedAttributeDropDown';
import {ColorAttributeDropDown} from './ColorAttributeDropDown';
import {DateRangeAttributeDropDown} from './DateRangeAttributeDropDown';
import {ViewSettingsActionTypes} from '../../store-view-settings/viewSettingsReducer';
import {useViewSettingsContext} from '../../store-view-settings/useViewSettingsContext';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const FilterDropDownStyledDiv = styled.div`
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-xxs) * 1px);
`;

export const FilterDropDown: FunctionComponent<IFilterDropDownProps> = ({filter}) => {
    const {t} = useSharedTranslation();
    const {dispatch} = useViewSettingsContext();
    let selectedDropDown: JSX.Element;

    const onFilterChange = (filterData: IExplorerFilter) =>
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

    switch (filter.attribute.format) {
        case AttributeFormat.numeric:
            selectedDropDown = <NumericAttributeDropDown filter={filter} onFilterChange={onFilterChange} />;
            break;
        case AttributeFormat.date:
            selectedDropDown = <DateAttributeDropDown filter={filter} onFilterChange={onFilterChange} />;
            break;
        case AttributeFormat.text:
        case AttributeFormat.rich_text:
            selectedDropDown = <TextAttributeDropDown filter={filter} onFilterChange={onFilterChange} />;
            break;
        case AttributeFormat.boolean:
            selectedDropDown = <BooleanAttributeDropDown filter={filter} onFilterChange={onFilterChange} />;
            break;
        case AttributeFormat.encrypted:
            selectedDropDown = <EncryptedAttributeDropDown filter={filter} onFilterChange={onFilterChange} />;
            break;
        case AttributeFormat.extended:
            selectedDropDown = <ExtendedAttributeDropDown filter={filter} onFilterChange={onFilterChange} />;
            break;
        case AttributeFormat.color:
            selectedDropDown = <ColorAttributeDropDown filter={filter} onFilterChange={onFilterChange} />;
            break;
        case AttributeFormat.date_range:
            selectedDropDown = <DateRangeAttributeDropDown filter={filter} onFilterChange={onFilterChange} />;
            break;
    }

    return (
        <FilterDropDownStyledDiv>
            {selectedDropDown}
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
