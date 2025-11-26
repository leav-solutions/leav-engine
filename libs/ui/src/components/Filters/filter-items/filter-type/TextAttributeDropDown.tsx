// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent, useEffect, useState} from 'react';
import styled from 'styled-components';
import {KitInput, KitSelect} from 'aristid-ds';
import {AttributeConditionFilter} from '_ui/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type IFilterChildrenDropDownProps} from './_types';
import {useConditionsOptionsByType} from './useConditionOptionsByType';
import {useDebouncedValue} from '_ui/hooks/useDebouncedValue';

const InputStyled = styled(KitInput)`
    width: 100%;
`;

export const TextAttributeDropDown: FunctionComponent<IFilterChildrenDropDownProps> = ({
    filter,
    onFilterChange,
    selectDropDownRef,
}) => {
    const {t} = useSharedTranslation();

    const {conditionOptionsByType} = useConditionsOptionsByType(filter);
    const [inputValue, setInputValue] = useState(filter.value || '');
    const debouncedInputValue = useDebouncedValue(inputValue, 300);

    useEffect(() => {
        setInputValue(filter.value || '');
    }, [filter.value]);

    // Only apply onFilterChange when the input is empty or there are more than 2 characters
    useEffect(() => {
        const valueToApply = debouncedInputValue;

        if (valueToApply.length === 0 && filter.value !== null) {
            onFilterChange({...filter, value: null});
            return;
        }

        if (valueToApply.length >= 3 && filter.value !== valueToApply) {
            onFilterChange({...filter, value: valueToApply});
        }
    }, [debouncedInputValue, onFilterChange, filter]);

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition => {
        onFilterChange({...filter, condition});
    };

    const _onInputChanged: ComponentProps<typeof KitInput>['onChange'] = event => {
        const newInputValue = event.target.value;
        setInputValue(newInputValue);
    };

    const showSearch =
        filter.condition !== AttributeConditionFilter.IS_EMPTY &&
        filter.condition !== AttributeConditionFilter.IS_NOT_EMPTY;

    return (
        <>
            <KitSelect
                options={conditionOptionsByType}
                onChange={_onConditionChanged}
                value={filter.condition}
                getPopupContainer={() => selectDropDownRef?.current ?? document.body}
                aria-label={String(t('explorer.filter-condition'))}
            />
            {showSearch && (
                <InputStyled
                    placeholder={String(t('explorer.type-a-value'))}
                    value={inputValue}
                    onChange={_onInputChanged}
                />
            )}
        </>
    );
};
