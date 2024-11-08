// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInput} from 'aristid-ds';
import {ChangeEvent, FocusEvent, FunctionComponent, useEffect, useRef, useState} from 'react';
import {
    IStandardFieldReducerState,
    IStandardFieldValue
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form, InputProps} from 'antd';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useValueDetailsButton} from '_ui/components/RecordEdition/EditRecordContent/shared/ValueDetailsBtn/useValueDetailsButton';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {useLang} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';

interface IDSInputEncryptedWrapper extends IProvidedByAntFormItem<InputProps> {
    state: IStandardFieldReducerState;
    attribute: RecordFormAttributeFragment;
    fieldValue: IStandardFieldValue;
    handleSubmit: (value: string, id?: string) => void;
    handleBlur: () => void;
    shouldShowValueDetailsButton?: boolean;
}

const KitInputPasswordStyled = styled(KitInput.Password)<{$shouldHighlightColor: boolean}>`
    color: ${({$shouldHighlightColor}) => ($shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial')};

    .kit-input-wrapper-helper {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
`;

export const DSInputEncryptedWrapper: FunctionComponent<IDSInputEncryptedWrapper> = ({
    value,
    onChange,
    state,
    attribute,
    fieldValue,
    handleSubmit,
    handleBlur,
    shouldShowValueDetailsButton = false
}) => {
    if (!onChange) {
        throw Error('DSInputEncryptedWrapper should be used inside a antd Form.Item');
    }

    const {t} = useSharedTranslation();
    const {errors} = Form.Item.useStatus();
    const {onValueDetailsButtonClick} = useValueDetailsButton({
        value: fieldValue?.value,
        attribute
    });
    const [hasChanged, setHasChanged] = useState(false);
    const {lang: availableLang} = useLang();

    const inputRef = useRef<any>(null);

    useEffect(() => {
        if (fieldValue.isEditing && inputRef.current) {
            inputRef.current.focus();
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

    const _handleOnBlur = (event: FocusEvent<HTMLInputElement>) => {
        if (!hasChanged) {
            handleBlur();
            return;
        }

        const valueToSubmit = event.target.value;
        if (valueToSubmit === '' && (state.isInheritedValue || state.isCalculatedValue)) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        if (!state.isInheritedValue && !state.isCalculatedValue) {
            handleSubmit(valueToSubmit, state.attribute.id);
        }

        onChange(event);
    };

    const _handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        setHasChanged(true);
        const inputValue = event.target.value;
        if ((state.isInheritedValue || state.isCalculatedValue) && inputValue === '' && event.type === 'click') {
            _resetToInheritedOrCalculatedValue();
            return;
        }
        onChange(event);
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
        <KitInputPasswordStyled
            // @ts-expect-error - ref is not a valid prop for Input.Password but works at runtime
            ref={inputRef}
            autoComplete="new-password"
            data-testid="kit-input-password"
            label={label}
            required={state.formElement.settings.required}
            status={errors.length > 0 ? 'error' : undefined}
            onInfoClick={shouldShowValueDetailsButton ? onValueDetailsButtonClick : null}
            helper={_getHelper()}
            value={value}
            disabled={state.isReadOnly}
            allowClear={!state.isInheritedNotOverrideValue && !state.isCalculatedNotOverrideValue}
            onBlur={_handleOnBlur}
            onChange={_handleOnChange}
            $shouldHighlightColor={
                !hasChanged && (state.isInheritedNotOverrideValue || state.isCalculatedNotOverrideValue)
            }
        />
    );
};
