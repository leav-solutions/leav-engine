// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitColorPicker} from 'aristid-ds';
import {FunctionComponent, useState} from 'react';
import styled from 'styled-components';
import {KitColor, KitColorPickerProps} from 'aristid-ds/dist/Kit/DataEntry/ColorPicker/types';
import {IStandFieldValueContentProps} from './_types';

const KitColorPickerStyled = styled(KitColorPicker)<{$shouldHighlightColor: boolean}>`
    width: 100%;
    justify-content: start; //TODO: Remove when the component is fixed in DS

    .ant-color-picker-trigger-text {
        color: ${({$shouldHighlightColor}) =>
            $shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'var(--general-utilities-text-primary)'};

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
    const [currentColor, setCurrentColor] = useState<KitColor>();
    const [currentHex, setCurrentHex] = useState((value as string) ?? '');

    const _handleOnOpenChange = async (open: boolean) => {
        if (!open) {
            if (!hasChanged) {
                setIsFocused(false);
                return;
            }

            onChange(currentColor, currentHex);
            await handleSubmit(currentColor.toHex(), attribute.id);
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
        setCurrentHex(hex);
        setCurrentColor(color);
        onChange(color, hex);
    };

    const _handleOnClear = async () => {
        setHasChanged(false);

        if (inheritedFlags.isInheritedValue) {
            onChange(undefined, inheritedFlags.inheritedValue.raw_value);
        } else if (calculatedFlags.isCalculatedValue) {
            onChange(undefined, calculatedFlags.calculatedValue.raw_value);
        }

        onChange(null, null);
        await handleSubmit(null, attribute.id);
        setIsFocused(false);
    };

    return (
        <KitColorPickerStyled
            id={attribute.id} // unused until color picker is fixed in DS / antd
            data-testid={attribute.id}
            value={currentHex}
            showText={isFocused || !presentationValue ? true : () => `${presentationValue}`}
            aria-label={label}
            disabled={readonly}
            disabledAlpha
            allowClear={!inheritedFlags.isInheritedNotOverrideValue && !calculatedFlags.isCalculatedNotOverrideValue}
            onOpenChange={_handleOnOpenChange}
            onChange={_handleOnChange}
            onClear={_handleOnClear}
            $shouldHighlightColor={
                !hasChanged &&
                (inheritedFlags.isInheritedNotOverrideValue || calculatedFlags.isCalculatedNotOverrideValue)
            }
        />
    );
};
