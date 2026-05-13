import {type ComponentProps, type FunctionComponent, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {KitInput, KitSelect} from 'aristid-ds';
import {AttributeConditionFilter} from '_ui/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type IFilterChildrenDropDownProps} from './_types';
import {useConditionsOptionsByType} from './useConditionOptionsByType';

const InputStyled = styled(KitInput)`
    width: 100%;
`;

const DEBOUNCE_DELAY = 300;
const MIN_SEARCH_LENGTH = 3;

export const TextAttributeDropDown: FunctionComponent<IFilterChildrenDropDownProps> = ({
    filter,
    onFilterChange,
    selectDropDownRef,
}) => {
    const {t} = useSharedTranslation();
    const {conditionOptionsByType} = useConditionsOptionsByType(filter);
    // Local state drives the input display, decoupled from filter.value which only updates after MIN_SEARCH_LENGTH chars
    const [inputValue, setInputValue] = useState(filter.value ?? '');
    // Ref to the pending debounce timer so we can cancel it on external resets
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // When filter.value is reset externally (e.g. RESET_FILTER), cancel any pending debounce first
        // to prevent it from dispatching a stale value that would overwrite the reset
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        setInputValue(filter.value ?? '');
    }, [filter.value]);

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition => {
        onFilterChange({...filter, condition});
    };

    const _onInputChanged: ComponentProps<typeof KitInput>['onChange'] = event => {
        const newValue = event.target.value;
        setInputValue(newValue);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (newValue.length === 0) {
            onFilterChange({...filter, value: null});
            return;
        }

        if (newValue.length >= MIN_SEARCH_LENGTH) {
            debounceTimerRef.current = setTimeout(() => {
                onFilterChange({...filter, value: newValue});
            }, DEBOUNCE_DELAY);
        }
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
