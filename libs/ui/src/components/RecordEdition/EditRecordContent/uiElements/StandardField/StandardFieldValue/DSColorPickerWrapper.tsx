// Copyright LEAV Solutions 2017
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
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useLang} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {useValueDetailsButton} from '../../../shared/ValueDetailsBtn/useValueDetailsButton';
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
    const {t} = useSharedTranslation();
    const {lang: availableLang} = useLang();
    const [hasChanged, setHasChanged] = useState(false);
    const [currentColor, setCurrentColor] = useState<KitColor>();
    const [currentHex, setCurrentHex] = useState((value as string) ?? '');
    const colorPickerRef = useRef<KitColorPickerRef>(null);
    const {onValueDetailsButtonClick} = useValueDetailsButton({
        value: fieldValue?.value,
        attribute
    });

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

    const _getHelper = () => {
        if (state.isInheritedOverrideValue) {
            return t('record_edition.inherited_input_helper', {inheritedValue: state.inheritedValue.raw_value});
        } else if (state.isCalculatedOverrideValue) {
            return t('record_edition.calculated_input_helper', {calculatedValue: state.calculatedValue.raw_value});
        }
        return;
    };

    const label = localizedTranslation(state.formElement.settings.label, availableLang);

    return (
        <KitColorPickerStyled
            ref={colorPickerRef}
            value={currentHex}
            aria-label={label}
            label={label}
            helper={_getHelper()}
            required={state.formElement.settings.required}
            onInfoClick={shouldShowValueDetailsButton ? onValueDetailsButtonClick : null}
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
