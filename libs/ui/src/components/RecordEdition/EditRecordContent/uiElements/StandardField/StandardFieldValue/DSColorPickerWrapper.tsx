// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitColorPicker} from 'aristid-ds';
import {FunctionComponent, useState} from 'react';
import styled from 'styled-components';
import {KitColorPickerProps} from 'aristid-ds/dist/Kit/DataEntry/ColorPicker/types';
import {IStandFieldValueContentProps} from './_types';
import {ColorFactory} from 'antd/lib/color-picker/color';
import {EMPTY_INITIAL_VALUE_UNDEFINED} from '../../../antdUtils';
import {ColorValueType} from 'antd/es/color-picker/interface';
import {Form} from 'antd';

const KitColorPickerStyled = styled(KitColorPicker)`
    width: 100%;

    .ant-color-picker-trigger-text {
        svg {
            color: var(--general-utilities-text-primary);
        }
    }
`;

const getColorFormatFromValue = (value: ColorValueType): KitColorPickerProps['format'] => {
    if (!value) {
        return 'hex';
    }

    const stringValue = value.toString().toLowerCase();

    if (stringValue.startsWith('#')) {
        return 'hex';
    } else if (stringValue.startsWith('rgb')) {
        return 'rgb';
    } else if (stringValue.startsWith('hsb')) {
        return 'hsb';
    }

    return 'hex';
};

const getValueToSubmit = (value: KitColorPickerProps['value'], format: KitColorPickerProps['format']) => {
    if (typeof value === 'string') {
        value = new ColorFactory(value);
    }

    switch (format) {
        case 'hex':
            return value.toHexString();
        case 'rgb':
            return value.toRgbString();
        case 'hsb':
            return value.toHsbString();
    }
};

export const DSColorPickerWrapper: FunctionComponent<IStandFieldValueContentProps<KitColorPickerProps>> = ({
    value,
    presentationValue,
    isLastValueOfMultivalues,
    removeLastValueOfMultivalues,
    onChange,
    attribute,
    label,
    readonly,
    handleSubmit,
    calculatedFlags,
    inheritedFlags,
    setActiveValue
}) => {
    // console.log('renal - value : ', value);
    // console.log('renal - presentationValue : ', presentationValue);
    if (!onChange) {
        throw Error('DSColorPickerWrapper should be used inside a antd Form.Item');
    }

    const isNewValueOfMultivalues = isLastValueOfMultivalues && value === EMPTY_INITIAL_VALUE_UNDEFINED;
    const focusedDefaultValue = attribute.multiple_values ? isNewValueOfMultivalues : false;
    const {errors} = Form.Item.useStatus();

    const [hasChanged, setHasChanged] = useState(false);
    const [isFocused, setIsFocused] = useState(focusedDefaultValue);
    const [key, setKey] = useState(0);
    const [format, setFormat] = useState<KitColorPickerProps['format']>(getColorFormatFromValue(value));

    const isErrors = errors.length > 0;

    const _handleOnOpenChange = async (open: boolean) => {
        if (!open) {
            if (!hasChanged) {
                setIsFocused(false);

                if (isNewValueOfMultivalues) {
                    removeLastValueOfMultivalues();
                }
                return;
            }

            await handleSubmit(getValueToSubmit(value, format), attribute.id);
            setIsFocused(false);
            setHasChanged(false);
        } else {
            setIsFocused(true);
            setActiveValue();
        }
    };

    const _handleOnChange = (
        color: Parameters<KitColorPickerProps['onChange']>[0],
        hex: Parameters<KitColorPickerProps['onChange']>[1]
    ) => {
        setHasChanged(true);
        onChange(color, hex);
    };

    const _handleOnClear = async () => {
        setHasChanged(false);

        if (inheritedFlags.isInheritedValue) {
            setKey(prevKey => prevKey + 1);

            const inheritedColor = new ColorFactory(inheritedFlags.inheritedValue.raw_payload);
            onChange(inheritedColor, inheritedFlags.inheritedValue.raw_payload);
        } else if (calculatedFlags.isCalculatedValue) {
            setKey(prevKey => prevKey + 1);

            const calculatedColor = new ColorFactory(calculatedFlags.calculatedValue.raw_payload);
            onChange(calculatedColor, calculatedFlags.calculatedValue.raw_payload);
        } else {
            onChange(undefined, undefined);
        }

        await handleSubmit(null, attribute.id);
        setIsFocused(false);
    };

    const _handleFormatChange = (newFormat: KitColorPickerProps['format']) => {
        setHasChanged(true);
        setFormat(newFormat);
    };

    return (
        <KitColorPickerStyled
            // This is a hack to force the color picker to re-render when needed (e.g. reset to inherited value)
            // https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key
            key={key}
            id={attribute.id} // unused until color picker is fixed in DS / antd
            autoFocus={isFocused}
            open={attribute.multiple_values ? isFocused : undefined}
            data-testid={attribute.id}
            value={value}
            format={format}
            showText={isFocused || isErrors || !presentationValue ? true : () => `${presentationValue}`}
            helper={isErrors ? String(errors[0]) : undefined}
            aria-label={label}
            disabled={readonly}
            allowClear={
                !!value &&
                !attribute.multiple_values &&
                !inheritedFlags.isInheritedNotOverrideValue &&
                !calculatedFlags.isCalculatedNotOverrideValue
            }
            onOpenChange={_handleOnOpenChange}
            onChange={_handleOnChange}
            onClear={_handleOnClear}
            onFormatChange={_handleFormatChange}
        />
    );
};
