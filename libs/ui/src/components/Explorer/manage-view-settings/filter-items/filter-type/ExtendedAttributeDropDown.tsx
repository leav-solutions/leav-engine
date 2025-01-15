// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent} from 'react';
import {KitSelect} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IFilterChildrenDropDownProps} from '_ui/components/Explorer/_types';
import {useConditionsOptionsByType} from './useConditionOptionsByType';

export const ExtendedAttributeDropDown: FunctionComponent<IFilterChildrenDropDownProps> = ({
    filter,
    onFilterChange
}) => {
    const {t} = useSharedTranslation();

    const {conditionOptionsByType} = useConditionsOptionsByType(filter);

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition =>
        onFilterChange({...filter, condition});

    return (
        <KitSelect
            options={conditionOptionsByType}
            onChange={_onConditionChanged}
            value={filter.condition}
            placeholder={t('explorer.select-condition')}
        />
    );
};
