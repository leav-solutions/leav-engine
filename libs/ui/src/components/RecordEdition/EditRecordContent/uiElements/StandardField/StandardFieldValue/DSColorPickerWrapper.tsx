// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitColorPicker} from 'aristid-ds';
import {FunctionComponent, useEffect, useRef, useState} from 'react';
import {
    IStandardFieldReducerState,
    IStandardFieldValue
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';
import styled from 'styled-components';
import {useLang} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {KitColor, KitColorPickerProps, KitColorPickerRef} from 'aristid-ds/dist/Kit/DataEntry/ColorPicker/types';

interface IDSColorPickerWrapperProps extends IProvidedByAntFormItem<KitColorPickerProps> {
    state: IStandardFieldReducerState;
    attribute: RecordFormAttributeFragment;
    fieldValue: IStandardFieldValue;
    handleSubmit: (value: string, id?: string) => void;
    handleBlur: () => void;
    shouldShowValueDetailsButton?: boolean;
}

const KitColorPickerStyled = styled(KitColorPicker)<{$shouldHighlightColor: boolean}>`
    .ant-color-picker-trigger-text {
        color: ${({$shouldHighlightColor}) =>
            $shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'var(--general-utilities-text-primary)'};

        svg {
            color: var(--general-utilities-text-primary);
        }
    }
`;

export const DSColorPickerWrapper: FunctionComponent<IDSColorPickerWrapperProps> = ({
    value,
    state,
    attribute,
    fieldValue,
    onChange,
    handleSubmit,
    handleBlur,
    shouldShowValueDetailsButton = false
}) => {
    if (!onChange) {
        throw Error('DSColorPickerWrapper should be used inside a antd Form.Item');
    }

    const {lang: availableLang} = useLang();
    const [hasChanged, setHasChanged] = useState(false);
    const [currentColor, setCurrentColor] = useState<KitColor>();
    const [currentHex, setCurrentHex] = useState((value as string) ?? '');
    const colorPickerRef = useRef<KitColorPickerRef>(null);

    useEffect(() => {
        if (fieldValue.isEditing) {
            colorPickerRef.current.focus();
        }
    }, [fieldValue.isEditing]);

    const _handleOnOpenChange = (open: boolean) => {
        if (!open) {
            if (!hasChanged) {
                handleBlur();
                return;
            }

            handleSubmit(currentColor.toHex(), state.attribute.id);
            onChange(currentColor, currentHex);
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

    const _handleOnClear = () => {
        setHasChanged(false);

        if (state.isInheritedValue) {
            onChange(undefined, state.inheritedValue.raw_value);
        } else if (state.isCalculatedValue) {
            onChange(undefined, state.calculatedValue.raw_value);
        }

        onChange(null, '');
        handleSubmit('', state.attribute.id);
    };

    const label = localizedTranslation(state.formElement.settings.label, availableLang);

    return (
        <KitColorPickerStyled
            ref={colorPickerRef}
            value={currentHex}
            aria-label={label}
            disabled={state.isReadOnly}
            disabledAlpha
            showText
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
