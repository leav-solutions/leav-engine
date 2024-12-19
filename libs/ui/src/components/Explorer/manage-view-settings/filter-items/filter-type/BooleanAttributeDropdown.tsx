// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitDivider, KitSpace, KitSwitch} from 'aristid-ds';
import {ComponentProps, FunctionComponent} from 'react';
import {FaClock, FaTrash} from 'react-icons/fa';
import {useViewSettingsContext} from '../../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../../store-view-settings/viewSettingsReducer';
import {IExplorerFilter, IFilterDropDownProps} from '_ui/components/Explorer/_types';
import {AttributeConditionFilter} from '_ui/types';

export const BooleanAttributeDropDown: FunctionComponent<IFilterDropDownProps> = ({filter}) => {
    const {t} = useSharedTranslation();
    const {dispatch} = useViewSettingsContext();

    const _updateFilter = (filterData: IExplorerFilter) => {
        dispatch({
            type: ViewSettingsActionTypes.CHANGE_FILTER_CONFIG,
            payload: filterData
        });
    };

    const _onBooleanChanged: ComponentProps<typeof KitSwitch>['onChange'] = checked => {
        _updateFilter({...filter, condition: AttributeConditionFilter.EQUAL, value: checked ? 'true' : 'false'});
    };

    const _onDeleteFilter: ComponentProps<typeof KitButton>['onClick'] = () =>
        dispatch({
            type: ViewSettingsActionTypes.REMOVE_FILTER,
            payload: {
                id: filter.id
            }
        });

    return (
        <KitSpace size="xxs" direction="vertical">
            <KitSwitch defaultValue={Boolean(filter.value) ?? undefined} onChange={_onBooleanChanged} />
            <KitDivider noMargin />
            <KitButton type="redirect" icon={<FaClock />} disabled>
                {t('explorer.reset-filter')}
            </KitButton>
            <KitButton type="redirect" icon={<FaTrash />} onClick={_onDeleteFilter}>
                {t('global.delete')}
            </KitButton>
        </KitSpace>
    );
};
