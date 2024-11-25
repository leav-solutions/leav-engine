// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInputNumber} from 'aristid-ds';
import {ComponentPropsWithRef, FocusEvent, FunctionComponent, useRef, useState} from 'react';
import {Form, GetRef} from 'antd';
import styled from 'styled-components';
import {IStandFieldValueContentProps} from './_types';
import {KitInputNumberProps} from 'aristid-ds/dist/Kit/DataEntry/InputNumber/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const KitInputNumberStyled = styled(KitInputNumber)<{$shouldHighlightColor: boolean}>`
    width: 100%;
    .ant-input-number-input-wrap .ant-input-number-input {
        color: ${({$shouldHighlightColor}) =>
            $shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial'};
    }
`;

export const DSInputNumberWrapper: FunctionComponent<IStandFieldValueContentProps<KitInputNumberProps>> = ({
    value,
    presentationValue,
    onChange,
    state,
    attribute,
    handleSubmit
}) => {
    if (!onChange) {
        throw Error('DSInputNumberWrapper should be used inside a antd Form.Item');
    }

    const [hasChanged, setHasChanged] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<GetRef<typeof KitInputNumberStyled>>(null);
    const {errors} = Form.Item.useStatus();
    const {t} = useSharedTranslation();

    const isErrors = errors.length > 0;

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
        const valueToSubmit = event.target.value;

        if (!hasChanged) {
            onChange(valueToSubmit);
            setIsFocused(false);
            return;
        }

        if (valueToSubmit === '' && (state.isInheritedValue || state.isCalculatedValue)) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        onChange(valueToSubmit);
        setIsFocused(false);
        await handleSubmit(valueToSubmit, state.attribute.id);
    };

    const _handleOnChange: ComponentPropsWithRef<typeof KitInputNumberStyled>['onChange'] = inputValue => {
        setHasChanged(true);
        onChange(inputValue);
    };

    return (
        <KitInputNumberStyled
            ref={inputRef}
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            value={value}
            formatter={v => (isFocused || isErrors || !presentationValue ? `${v}` : `${presentationValue}`)}
            disabled={state.isReadOnly}
            onChange={_handleOnChange}
            onFocus={_handleFocus}
            onBlur={_handleOnBlur}
            $shouldHighlightColor={
                !hasChanged && (state.isInheritedNotOverrideValue || state.isCalculatedNotOverrideValue)
            }
            placeholder={t('record_edition.placeholder.enter_a_number')}
        />
    );
};
