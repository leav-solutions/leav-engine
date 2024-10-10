// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInput} from 'aristid-ds';
import {ChangeEvent, FocusEvent, FunctionComponent, useEffect, useRef, useState} from 'react';
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

interface IDSInputWrapperProps extends IProvidedByAntFormItem<InputProps> {
    state: IStandardFieldReducerState;
    attribute: RecordFormAttributeFragment;
    fieldValue: IStandardFieldValue;
    handleSubmit: (value: string, id?: string) => void;
    handleBlur: () => void;
    shouldShowValueDetailsButton?: boolean;
}

const KitInputStyled = styled(KitInput)<{$shouldHighlightColor: boolean}>`
    color: ${({$shouldHighlightColor}) => ($shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial')};
`;

export const DSInputWrapper: FunctionComponent<IDSInputWrapperProps> = ({
    value,
    onChange,
    state,
    attribute,
    fieldValue,
    handleSubmit,
    handleBlur,
    shouldShowValueDetailsButton = false
}) => {
    if (attribute.id === 'simple_text_with_calcul' || attribute.id === 'offers_label') {
        console.log('------ DSInputWrapper ------');
        console.log('attribute', attribute);
        console.log('fieldValue', fieldValue);
        console.log('state', state);
        console.log('value', value);
        console.log('test');
    }

    const {t} = useSharedTranslation();
    const {errors} = Form.Item.useStatus();
    const {onValueDetailsButtonClick} = useValueDetailsButton({
        value: fieldValue?.value,
        attribute
    });
    const [hasChanged, setHasChanged] = useState(false);
    const {lang: availableLang} = useLang();
    const inputRef = useRef<GetRef<typeof KitInputStyled>>(null);

    useEffect(() => {
        if (fieldValue.isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [fieldValue.isEditing]);

    const _resetToInheritedValue = () => {
        setHasChanged(false);
        onChange(state.inheritedValue.raw_value);
        handleSubmit('', state.attribute.id);
    };

    const _handleOnBlur = (event: FocusEvent<HTMLInputElement>) => {
        if (!hasChanged) {
            handleBlur();
            return;
        }

        const valueToSubmit = event.target.value;
        if (valueToSubmit === '' && state.isInheritedValue) {
            _resetToInheritedValue();
            return;
        }

        handleSubmit(valueToSubmit, state.attribute.id);

        onChange(event);
    };

    const _handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        setHasChanged(true);
        const inputValue = event.target.value;
        if (state.isInheritedValue && inputValue === '' && event.type === 'click') {
            _resetToInheritedValue();
            return;
        }

        if (inputValue === '' && event.type === 'click') {
            handleSubmit(inputValue, state.attribute.id);
        }

        onChange(event);
    };

    const label = localizedTranslation(state.formElement.settings.label, availableLang);

    console.log('!hasChanged', !hasChanged);
    console.log('state.isInheritedNotOverrideValue', state.isInheritedNotOverrideValue);
    console.log('state.isCalculatedNotOverrideValue', state.isCalculatedNotOverrideValue);

    const test = !hasChanged && state.isInheritedNotOverrideValue;
    console.log('shouldHighlightColor', test);
    const test2 = !hasChanged && state.isCalculatedNotOverrideValue;
    console.log('shouldHighlightColor', test2);

    return (
        <KitInputStyled
            ref={inputRef}
            required={state.formElement.settings.required}
            label={label}
            onInfoClick={shouldShowValueDetailsButton ? onValueDetailsButtonClick : null}
            status={errors.length > 0 ? 'error' : undefined}
            helper={
                state.isInheritedOverrideValue
                    ? t('record_edition.inherited_input_helper', {
                          inheritedValue: state.inheritedValue.raw_value
                      })
                    : undefined
            }
            value={value}
            disabled={state.isReadOnly}
            allowClear={!state.isInheritedNotOverrideValue}
            onBlur={_handleOnBlur}
            onChange={_handleOnChange}
            $shouldHighlightColor={!hasChanged && state.isInheritedNotOverrideValue}
        />
    );
};
