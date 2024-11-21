// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInput} from 'aristid-ds';
import {ChangeEvent, FocusEvent, FunctionComponent, useState} from 'react';
import {Form} from 'antd';
import styled from 'styled-components';
import {IStandFieldValueContentProps} from './_types';
import {IKitInput} from 'aristid-ds/dist/Kit/DataEntry/Input/types';

const KitInputStyled = styled(KitInput)<{$shouldHighlightColor: boolean}>`
    color: ${({$shouldHighlightColor}) => ($shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial')};
`;

export const DSInputWrapper: FunctionComponent<IStandFieldValueContentProps<IKitInput>> = ({
    value,
    presentationValue,
    onChange,
    state,
    attribute,
    handleSubmit
}) => {
    if (!onChange) {
        throw Error('DSInputWrapper should be used inside a antd Form.Item');
    }

    const [hasChanged, setHasChanged] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const {errors} = Form.Item.useStatus();

    const isErrors = errors.length > 0;
    const valueToDisplay = isFocused || isErrors ? value : presentationValue;

    const _resetToInheritedOrCalculatedValue = async () => {
        setHasChanged(false);
        if (state.isInheritedValue) {
            onChange(state.inheritedValue.raw_payload);
        } else if (state.isCalculatedValue) {
            onChange(state.calculatedValue.raw_payload);
        }
        await handleSubmit('', state.attribute.id);
    };

    const _handleFocus = () => setIsFocused(true);

    const _handleOnBlur = async (event: FocusEvent<HTMLInputElement>) => {
        if (!hasChanged) {
            onChange(event);
            setIsFocused(false);
            return;
        }

        const valueToSubmit = event.target.value;
        if (valueToSubmit === '' && (state.isInheritedValue || state.isCalculatedValue)) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        onChange(event);
        setIsFocused(false);
        await handleSubmit(valueToSubmit, state.attribute.id);
    };

    // TODO remove this function to use onClear Prop when ant is updated to 5.20+ (and other inputs too)
    const _handleOnChange = async (event: ChangeEvent<HTMLInputElement>) => {
        setHasChanged(true);
        const inputValue = event.target.value;
        if ((state.isInheritedValue || state.isCalculatedValue) && inputValue === '' && event.type === 'click') {
            _resetToInheritedOrCalculatedValue();
            return;
        }
        onChange(event);
        if (inputValue === '' && event.type === 'click') {
            await handleSubmit(inputValue, state.attribute.id);
        }
    };

    return (
        <KitInputStyled
            disabled={state.isReadOnly}
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            value={valueToDisplay}
            allowClear={!state.isInheritedNotOverrideValue && !state.isCalculatedNotOverrideValue}
            onChange={_handleOnChange}
            onFocus={_handleFocus}
            onBlur={_handleOnBlur}
            $shouldHighlightColor={
                !hasChanged && (state.isInheritedNotOverrideValue || state.isCalculatedNotOverrideValue)
            }
            placeholder="TODO" //TODO: Traduire et faire pour tous les autres inputs  + liste de valeurs (en attente wording Cyril - XSTREAM-954)
        />
    );
};
