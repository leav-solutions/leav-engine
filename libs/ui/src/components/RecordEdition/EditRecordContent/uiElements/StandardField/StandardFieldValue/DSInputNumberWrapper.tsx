// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInputNumber} from 'aristid-ds';
import {type ComponentPropsWithRef, type FocusEvent, type FunctionComponent, useRef, useState} from 'react';
import {Form, type GetRef} from 'antd';
import styled from 'styled-components';
import {type IStandFieldValueContentProps} from './_types';
import {type KitInputNumberProps} from 'aristid-ds/dist/Kit/DataEntry/InputNumber/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {EMPTY_INITIAL_VALUE_STRING} from '../../../antdUtils';

const KitInputNumberStyled = styled(KitInputNumber)`
    width: 100%;
`;

export const DSInputNumberWrapper: FunctionComponent<IStandFieldValueContentProps<KitInputNumberProps>> = ({
    value,
    presentationValue,
    isLastValueOfMultivalues,
    removeLastValueOfMultivalues,
    onChange,
    attribute,
    handleSubmit,
    readonly,
    calculatedFlags,
    inheritedFlags,
}) => {
    if (!onChange) {
        throw Error('DSInputNumberWrapper should be used inside a antd Form.Item');
    }

    const isNewValueOfMultivalues = isLastValueOfMultivalues && value === EMPTY_INITIAL_VALUE_STRING;
    const focusedDefaultValue = attribute.multiple_values ? isNewValueOfMultivalues : false;

    const [hasChanged, setHasChanged] = useState(false);
    const [isFocused, setIsFocused] = useState(focusedDefaultValue);
    const inputRef = useRef<GetRef<typeof KitInputNumberStyled>>(null);
    const {errors} = Form.Item.useStatus();
    const {t} = useSharedTranslation();

    const isErrors = errors.length > 0;

    // TODO: Remove inheritedValues[0] and calculatedValues[0] when we will have a proper way to override multiple values. For now, those attributes are set in readonly mode.
    const _resetToInheritedOrCalculatedValue = async () => {
        setHasChanged(false);
        if (inheritedFlags.isInheritedValues) {
            onChange(inheritedFlags.inheritedValues[0].raw_payload);
        } else if (calculatedFlags.isCalculatedValues) {
            onChange(calculatedFlags.calculatedValues[0].raw_payload);
        }
        await handleSubmit(null, attribute.id);
    };

    const _handleFocus = () => {
        setIsFocused(true);
    };

    const _handleOnBlur = async (event: FocusEvent<HTMLInputElement>) => {
        setHasChanged(false);
        const valueToSubmit = event.target.value;
        if (!hasChanged) {
            onChange(valueToSubmit);
            setIsFocused(false);

            if (isNewValueOfMultivalues) {
                removeLastValueOfMultivalues();
            }
            return;
        }

        if (valueToSubmit === '' && (inheritedFlags.isInheritedValues || calculatedFlags.isCalculatedValues)) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        onChange(valueToSubmit);
        await handleSubmit(valueToSubmit, attribute.id);
        setIsFocused(false);
    };

    const _handleOnChange: ComponentPropsWithRef<typeof KitInputNumberStyled>['onChange'] = inputValue => {
        setHasChanged(true);
        onChange(inputValue);
    };

    return (
        <KitInputNumberStyled
            ref={inputRef}
            id={attribute.id}
            autoFocus={isFocused}
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            value={value}
            formatter={v => (isFocused || isErrors || !presentationValue ? `${v}` : `${presentationValue}`)}
            readonly={readonly}
            onChange={_handleOnChange}
            onFocus={_handleFocus}
            onBlur={_handleOnBlur}
            placeholder={t('record_edition.placeholder.enter_a_number')}
        />
    );
};
