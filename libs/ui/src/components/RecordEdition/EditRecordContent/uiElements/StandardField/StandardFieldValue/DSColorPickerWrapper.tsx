// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitColorPicker} from 'aristid-ds';
import {FunctionComponent, useState} from 'react';
import styled from 'styled-components';
import {useLang} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';
import {KitColor, KitColorPickerProps} from 'aristid-ds/dist/Kit/DataEntry/ColorPicker/types';
import {IStandFieldValueContentProps} from './_types';

const KitColorPickerStyled = styled(KitColorPicker)<{$shouldHighlightColor: boolean}>`
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
    state,
    attribute,
    handleSubmit
}) => {
    if (!onChange) {
        throw Error('DSColorPickerWrapper should be used inside a antd Form.Item');
    }

    const {lang: availableLang} = useLang();
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
            setIsFocused(false);
            await handleSubmit(currentColor.toHex(), state.attribute.id);
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

        if (state.isInheritedValue) {
            onChange(undefined, state.inheritedValue.raw_value);
        } else if (state.isCalculatedValue) {
            onChange(undefined, state.calculatedValue.raw_value);
        }

        onChange(null, '');
        setIsFocused(false);
        await handleSubmit('', state.attribute.id);
    };

    const label = localizedTranslation(state.formElement.settings.label, availableLang);

    return (
        <KitColorPickerStyled
            value={currentHex}
            showText={isFocused ? true : () => `${presentationValue}`}
            aria-label={label}
            disabled={state.isReadOnly}
            disabledAlpha
            allowClear={!state.isInheritedNotOverrideValue && !state.isCalculatedNotOverrideValue}
            onOpenChange={_handleOnOpenChange}
            onChange={_handleOnChange}
            onClear={_handleOnClear}
            $shouldHighlightColor={
                !hasChanged && (state.isInheritedNotOverrideValue || state.isCalculatedNotOverrideValue)
            }
        />
    );
};
