// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInput} from 'aristid-ds';
import {ChangeEvent, FocusEvent, FunctionComponent, useState} from 'react';
import {Form} from 'antd';
import {IStandFieldValueContentProps} from './_types';
import {IKitInput} from 'aristid-ds/dist/Kit/DataEntry/Input/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {EMPTY_INITIAL_VALUE_STRING} from '../../../antdUtils';

export const DSInputWrapper: FunctionComponent<IStandFieldValueContentProps<IKitInput>> = ({
    value,
    presentationValue,
    isLastValueOfMultivalues,
    removeLastValueOfMultivalues,
    onChange,
    attribute,
    readonly,
    handleSubmit,
    calculatedFlags,
    inheritedFlags,
    setActiveValue
}) => {
    console.log('renal - value : ', value);
    console.log('renal - presentationValue : ', presentationValue);
    if (!onChange) {
        throw Error('DSInputWrapper should be used inside a antd Form.Item');
    }

    const isNewValueOfMultivalues = isLastValueOfMultivalues && value === EMPTY_INITIAL_VALUE_STRING;
    const focusedDefaultValue = attribute.multiple_values ? isNewValueOfMultivalues : false;

    const [hasChanged, setHasChanged] = useState(false);
    const [isFocused, setIsFocused] = useState(focusedDefaultValue);
    const {errors} = Form.Item.useStatus();
    const {t} = useSharedTranslation();

    const isErrors = errors.length > 0;
    const valueToDisplay = isFocused || isErrors || !presentationValue ? value : presentationValue;

    const _resetToInheritedOrCalculatedValue = async () => {
        if (inheritedFlags.isInheritedValue) {
            onChange(inheritedFlags.inheritedValue.raw_payload);
        } else if (calculatedFlags.isCalculatedValue) {
            onChange(calculatedFlags.calculatedValue.raw_payload);
        }
        await handleSubmit(null, attribute.id);
    };

    const _handleOnFocus = () => {
        setIsFocused(true);
        setActiveValue();
    };

    const _handleOnBlur = async (event: FocusEvent<HTMLInputElement>) => {
        setHasChanged(false);
        if (!hasChanged) {
            onChange(event);
            setIsFocused(false);

            if (isNewValueOfMultivalues) {
                removeLastValueOfMultivalues();
            }
            return;
        }

        const inputValue = event.target.value;
        if (inputValue === '' && (inheritedFlags.isInheritedValue || calculatedFlags.isCalculatedValue)) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        onChange(event);
        await handleSubmit(inputValue, attribute.id);
        setIsFocused(false);
    };

    const _handleOnChange = async (event: ChangeEvent<HTMLInputElement>) => {
        setHasChanged(true);
        onChange(event);
    };

    return (
        <KitInput
            id={attribute.id}
            autoFocus={isFocused}
            disabled={readonly}
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            value={valueToDisplay}
            allowClear={!!value && !attribute.multiple_values}
            onChange={_handleOnChange}
            onFocus={_handleOnFocus}
            onBlur={_handleOnBlur}
            placeholder={t('record_edition.placeholder.enter_a_text')}
        />
    );
};
