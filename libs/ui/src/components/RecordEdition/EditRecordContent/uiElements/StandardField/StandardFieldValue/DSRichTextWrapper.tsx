// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useState} from 'react';
import {Form} from 'antd';
import {KitRichText} from 'aristid-ds';
import {IStandFieldValueContentProps} from './_types';
import {KitRichTextProps} from 'aristid-ds/dist/Kit/DataEntry/RichText/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const isEmptyValue = value => !value || value === '<p></p>';

export const DSRichTextWrapper: FunctionComponent<IStandFieldValueContentProps<KitRichTextProps>> = ({
    value,
    presentationValue,
    onChange,
    attribute,
    readonly,
    handleSubmit,
    calculatedFlags,
    inheritedFlags
}) => {
    if (!onChange) {
        throw Error('DSRichTextWrapper should be used inside a antd Form.Item');
    }

    const [hasChanged, setHasChanged] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
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

    const _handleFocus = () => setIsFocused(true);

    const _handleOnBlur = async inputValue => {
        const valueToSubmit = isEmptyValue(inputValue) ? null : inputValue;
        if (!hasChanged) {
            onChange(valueToSubmit);
            setIsFocused(false);
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
        if (inheritedFlags.isInheritedValue && isEmptyValue(inputValue)) {
            _resetToInheritedOrCalculatedValue();
            return;
        }
        onChange(inputValue);
    };

    return (
        <KitRichText
            id={attribute.id}
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            value={valueToDisplay}
            disabled={readonly}
            onChange={_handleOnChange}
            onFocus={_handleFocus}
            onBlur={_handleOnBlur}
            placeholder={t('record_edition.placeholder.enter_a_text')}
        />
    );
};
