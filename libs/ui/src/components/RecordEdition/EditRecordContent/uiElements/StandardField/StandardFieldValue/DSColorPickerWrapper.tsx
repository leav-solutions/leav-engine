// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitColorPicker} from 'aristid-ds';
import {FunctionComponent, useState} from 'react';
import styled from 'styled-components';
import {KitColorPickerProps} from 'aristid-ds/dist/Kit/DataEntry/ColorPicker/types';
import {IStandFieldValueContentProps} from './_types';
import {ColorFactory} from 'antd/lib/color-picker/color';

const KitColorPickerStyled = styled(KitColorPicker)`
    width: 100%;

    .ant-color-picker-trigger-text {
        svg {
            color: var(--general-utilities-text-primary);
        }
    }
`;

export const DSColorPickerWrapper: FunctionComponent<IStandFieldValueContentProps<KitColorPickerProps>> = ({
    value,
    presentationValue,
    onChange,
    attribute,
    label,
    readonly,
    handleSubmit,
    calculatedFlags,
    inheritedFlags
}) => {
    if (!onChange) {
        throw Error('DSColorPickerWrapper should be used inside a antd Form.Item');
    }

    const [hasChanged, setHasChanged] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [key, setKey] = useState(0);

    const _handleOnOpenChange = async (open: boolean) => {
        if (!open) {
            if (!hasChanged) {
                setIsFocused(false);
                return;
            }

            const valueToSubmit = typeof value !== 'string' && value !== null ? value.toHex() : value?.toString();
            await handleSubmit(valueToSubmit, attribute.id);
            setIsFocused(false);
        } else {
            setIsFocused(true);
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

    return (
        <KitColorPickerStyled
            // This is a hack to force the color picker to re-render when needed (e.g. reset to inherited value)
            // https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key
            key={key}
            id={attribute.id} // unused until color picker is fixed in DS / antd
            data-testid={attribute.id}
            value={value}
            showText={isFocused || !presentationValue ? true : () => `${presentationValue}`}
            aria-label={label}
            disabled={readonly}
            disabledAlpha
            allowClear={
                value && !inheritedFlags.isInheritedNotOverrideValue && !calculatedFlags.isCalculatedNotOverrideValue
            }
            onOpenChange={_handleOnOpenChange}
            onChange={_handleOnChange}
            onClear={_handleOnClear}
        />
    );
};
