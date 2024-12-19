// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitDivider, KitSelect, KitSpace} from 'aristid-ds';
import {ComponentProps, FunctionComponent} from 'react';
import {FaClock, FaTrash} from 'react-icons/fa';
import {IExplorerFilter, IFilterDropDownProps} from '../../../_types';
import {useViewSettingsContext} from '../../store-view-settings/useViewSettingsContext';
import {ViewSettingsActionTypes} from '../../store-view-settings/viewSettingsReducer';
import {FilterValueList} from './FilterValueList';

// TODO : This is an exemple file showing ho to customize dropdown Panel content. Don't mind the content of the file, missing types,... it's just an example.

const conditions = [
    {
        label: 'Egal à',
        value: 'eq'
    },
    {
        label: 'Différent de',
        value: 'neq'
    },
    {
        label: 'Commence par',
        value: 'start'
    },
    {
        label: 'Contient',
        value: 'contains'
    },
    {
        label: 'Ne contient pas',
        value: 'not_contains'
    },
    {
        label: 'Est dans la liste',
        value: 'in'
    },
    {
        label: "N'est pas dans la liste",
        value: 'not_in'
    }
];

const attributeValuesList = ['toto', 'tata', 'Value 3', 'Value 4', 'Value 5'];

export const SimpleFilterDropdown: FunctionComponent<IFilterDropDownProps> = ({filter}) => {
    const {t} = useSharedTranslation();
    const {dispatch} = useViewSettingsContext();

    const _updateFilter = (filterData: IExplorerFilter) => {
        dispatch({
            type: ViewSettingsActionTypes.CHANGE_FILTER_CONFIG,
            payload: filterData
        });
    };

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition => {
        _updateFilter({...filter, condition});
    };

    const _onValueClick: ComponentProps<typeof FilterValueList>['onSelectionChanged'] = value => {
        _updateFilter({...filter, value: value.join('-')});
    };

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
        <KitSpace size="xxs" direction="vertical">
            <KitSelect options={conditions} onChange={_onConditionChanged} value={filter.condition} />
            <FilterValueList
                values={attributeValuesList}
                multiple={false}
                freeEntry={false}
                selectedValues={filter.value === null ? [] : [filter.value]}
                onSelectionChanged={_onValueClick}
            />
            <KitDivider noMargin />
            <KitButton type="redirect" icon={<FaClock />} onClick={_onResetFilter}>
                {t('explorer.reset-filter')}
            </KitButton>
            <KitButton type="redirect" icon={<FaTrash />} onClick={_onDeleteFilter}>
                {t('global.delete')}
            </KitButton>
        </KitSpace>
    );
};
