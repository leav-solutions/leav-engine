// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent} from 'react';
import {KitSelect} from 'aristid-ds';
import {AttributeConditionFilter} from '_ui/types';
import {IFilterChildrenDropDownProps} from '_ui/components/Explorer/_types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

export const BooleanAttributeDropDown: FunctionComponent<IFilterChildrenDropDownProps> = ({filter, onFilterChange}) => {
    const {t} = useSharedTranslation();
    const _onSelectionChanged: ComponentProps<typeof KitSelect>['onChange'] = value => {
        onFilterChange({...filter, condition: AttributeConditionFilter.EQUAL, value});
    };

    const valuesOptions = [
        {
            label: t('explorer.true'),
            value: 'true'
        },
        {
            label: t('explorer.false'),
            value: 'false'
        }
    ];

    return (
        <KitSelect
            options={valuesOptions}
            onChange={_onSelectionChanged}
            value={filter.value}
            placeholder={t('filters.equal')}
        />
    );
};
