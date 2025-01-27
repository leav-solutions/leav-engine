// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent} from 'react';
import styled from 'styled-components';
import {KitInputNumber, KitSelect} from 'aristid-ds';
import {AttributeConditionFilter} from '_ui/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IFilterChildrenDropDownProps} from '_ui/components/Explorer/_types';
import {useConditionsOptionsByType} from './useConditionOptionsByType';

const InputNumberStyled = styled(KitInputNumber)`
    width: 100%;
`;

export const NumericAttributeDropDown: FunctionComponent<IFilterChildrenDropDownProps> = ({filter, onFilterChange}) => {
    const {t} = useSharedTranslation();

    const {conditionOptionsByType} = useConditionsOptionsByType(filter);

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition =>
        onFilterChange({...filter, condition});

    const _onInputChanged: ComponentProps<typeof KitInputNumber>['onChange'] = value =>
        onFilterChange({...filter, value: value === null ? null : String(value)});

    const showInput =
        filter.condition !== AttributeConditionFilter.IS_EMPTY &&
        filter.condition !== AttributeConditionFilter.IS_NOT_EMPTY;

    return (
        <>
            <KitSelect options={conditionOptionsByType} onChange={_onConditionChanged} value={filter.condition} />
            {showInput && (
                <InputNumberStyled
                    placeholder={String(t('explorer.type-a-value'))}
                    value={filter.value}
                    onChange={_onInputChanged}
                />
            )}
        </>
    );
};
