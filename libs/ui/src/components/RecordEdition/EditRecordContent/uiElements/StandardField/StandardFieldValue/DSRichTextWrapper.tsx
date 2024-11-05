// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useEffect, useRef, useState} from 'react';
import {
    IStandardFieldReducerState,
    IStandardFieldValue
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form, GetRef, InputProps} from 'antd';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useValueDetailsButton} from '_ui/components/RecordEdition/EditRecordContent/shared/ValueDetailsBtn/useValueDetailsButton';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {useLang} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';
import {KitRichText} from 'aristid-ds';

interface IDSRichTextWrapperProps extends IProvidedByAntFormItem<InputProps> {
    state: IStandardFieldReducerState;
    attribute: RecordFormAttributeFragment;
    fieldValue: IStandardFieldValue;
    handleSubmit: (value: string, id?: string) => void;
    handleBlur: () => void;
    shouldShowValueDetailsButton?: boolean;
}

const KitRichTextStyled = styled(KitRichText)<{$shouldHighlightColor: boolean}>`
    color: ${({$shouldHighlightColor}) => ($shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial')};
`;

const isEmptyValue = value => !value || value === '<p></p>';

export const DSRichTextWrapper: FunctionComponent<IDSRichTextWrapperProps> = ({
    value,
    onChange,
    state,
    attribute,
    fieldValue,
    handleSubmit,
    handleBlur,
    shouldShowValueDetailsButton = false
}) => {
    const {t} = useSharedTranslation();
    const {errors} = Form.Item.useStatus();
    const {onValueDetailsButtonClick} = useValueDetailsButton({
        value: fieldValue?.value,
        attribute
    });
    const [hasChanged, setHasChanged] = useState(false);
    const {lang: availableLang} = useLang();
    const inputRef = useRef<GetRef<typeof KitRichTextStyled>>(null);

    useEffect(() => {
        if (fieldValue.isEditing && inputRef.current) {
            (inputRef.current.children[0] as HTMLElement).focus();
        }
    }, [fieldValue.isEditing]);

    const _resetToInheritedOrCalculatedValue = () => {
        setHasChanged(false);
        if (state.isInheritedValue) {
            onChange(state.inheritedValue.raw_value);
        } else if (state.isCalculatedValue) {
            onChange(state.calculatedValue.raw_value);
        }
        handleSubmit('', state.attribute.id);
    };

    const _handleOnBlur = inputValue => {
        if (!hasChanged) {
            handleBlur();
            return;
        }

        const valueToSubmit = isEmptyValue(inputValue) ? '' : inputValue;

        if (valueToSubmit === '' && (state.isInheritedValue || state.isCalculatedValue)) {
            _resetToInheritedOrCalculatedValue();
            return;
        }
        if (hasChanged || (!state.isInheritedValue && !state.isCalculatedValue)) {
            handleSubmit(valueToSubmit, state.attribute.id);
        }
        onChange(valueToSubmit);
        return;
    };

    const _handleOnChange = inputValue => {
        setHasChanged(true);
        if (state.isInheritedValue && isEmptyValue(inputValue)) {
            _resetToInheritedOrCalculatedValue();
            return;
        }
        onChange(inputValue);
    };

    const _getHelper = () => {
        if (state.isInheritedOverrideValue) {
            return t('record_edition.inherited_input_helper', {
                inheritedValue: state.inheritedValue.raw_value
            });
        } else if (state.isCalculatedOverrideValue) {
            return t('record_edition.calculated_input_helper', {
                calculatedValue: state.calculatedValue.raw_value
            });
        }
        return;
    };

    const label = localizedTranslation(state.formElement.settings.label, availableLang);

    return (
        <KitRichTextStyled
            ref={inputRef}
            required={state.formElement.settings.required}
            label={label}
            onInfoClick={shouldShowValueDetailsButton ? onValueDetailsButtonClick : null}
            status={errors.length > 0 ? 'error' : undefined}
            helper={_getHelper()}
            value={value as string}
            disabled={state.isReadOnly}
            onChange={_handleOnChange}
            onBlur={_handleOnBlur}
            $shouldHighlightColor={
                (!hasChanged && state.isInheritedNotOverrideValue) || state.isCalculatedNotOverrideValue
            }
        />
    );
};
