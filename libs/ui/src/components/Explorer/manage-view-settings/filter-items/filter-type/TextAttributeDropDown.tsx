// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent} from 'react';
import styled from 'styled-components';
import {KitInput, KitSelect} from 'aristid-ds';
import {AttributeConditionFilter} from '_ui/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IFilterChildrenDropDownProps} from './_types';
import {useConditionsOptionsByType} from './useConditionOptionsByType';

const InputStyled = styled(KitInput)`
    width: 100%;
`;

export const TextAttributeDropDown: FunctionComponent<IFilterChildrenDropDownProps> = ({
    filter,
    onFilterChange,
    selectDropDownRef
}) => {
    const {t} = useSharedTranslation();

    const {conditionOptionsByType} = useConditionsOptionsByType(filter);

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition => {
        onFilterChange({...filter, condition});
    };

    // TODO debounce ?
    const _onInputChanged: ComponentProps<typeof KitInput>['onChange'] = event => {
        const shouldIgnoreInputChange =
            event.target.value.length < 3 && (filter.value?.length ?? 0) <= event.target.value.length;
        if (shouldIgnoreInputChange) {
            return;
        }
        onFilterChange({...filter, value: event.target.value.length === 0 ? null : event.target.value});
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
                    value={filter.value ?? undefined}
                    onChange={_onInputChanged}
                />
            )}
        </>
    );
};
