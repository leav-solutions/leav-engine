// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, useState} from 'react';
import {Form} from 'antd';
import {KitRichText} from 'aristid-ds';
import {type IStandFieldValueContentProps} from './_types';
import {type KitRichTextProps} from 'aristid-ds/dist/Kit/DataEntry/RichText/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {EMPTY_INITIAL_VALUE_STRING} from '../../../antdUtils';

const LEADING_EMPTY_P_TAG = /^<p>(\s|&nbsp;)*<\/p>/;
const TRAILING_EMPTY_P_TAG = /(<p>(\s|&nbsp;)*<\/p>)+$/;

const cleanRichTextValue = (value: string) => {
    if (!value) {
        return null;
    }
    const cleanedValue = value.replace(LEADING_EMPTY_P_TAG, '').replace(TRAILING_EMPTY_P_TAG, '').trim();

    return cleanedValue === '' ? null : cleanedValue;
};

export const DSRichTextWrapper: FunctionComponent<IStandFieldValueContentProps<KitRichTextProps>> = ({
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
}) => {
    if (!onChange) {
        throw Error('DSRichTextWrapper should be used inside a antd Form.Item');
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
        setHasChanged(false);
        if (inheritedFlags.isInheritedValue) {
            onChange(inheritedFlags.inheritedValue.raw_payload);
        } else if (calculatedFlags.isCalculatedValue) {
            onChange(calculatedFlags.calculatedValue.raw_payload);
        }
        await handleSubmit(null, attribute.id);
    };

    const _handleFocus = () => {
        setIsFocused(true);
    };

    const _handleOnBlur = async (inputValue: string) => {
        setHasChanged(false);
        const valueToSubmit = cleanRichTextValue(inputValue);
        if (!hasChanged) {
            onChange(valueToSubmit);
            setIsFocused(false);

            if (isNewValueOfMultivalues) {
                removeLastValueOfMultivalues();
            }
            return;
        }

        if (valueToSubmit === null && (inheritedFlags.isInheritedValue || calculatedFlags.isCalculatedValue)) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        onChange(valueToSubmit);
        await handleSubmit(valueToSubmit, attribute.id);
        setIsFocused(false);
    };

    const _handleOnChange = inputValue => {
        setHasChanged(true);
        onChange(inputValue);
    };

    return (
        <KitRichText
            id={attribute.id}
            autoFocus={isFocused}
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            value={valueToDisplay}
            readonly={readonly}
            onChange={_handleOnChange}
            onFocus={_handleFocus}
            onBlur={_handleOnBlur}
            placeholder={t('record_edition.placeholder.enter_a_text')}
            maxLength={attribute.character_limit ?? undefined}
            showCount
        />
    );
};
