// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInput} from 'aristid-ds';
import {ChangeEvent, FocusEvent, FunctionComponent, ReactNode, useState} from 'react';
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

interface IDSInputWrapperProps extends IProvidedByAntFormItem<InputProps> {
    state: IStandardFieldReducerState;
    attribute: RecordFormAttributeFragment;
    fieldValue: IStandardFieldValue;
    handleSubmit: (value: string, id?: string) => void;
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

export const DSInputPasswordWrapper: FunctionComponent<IDSInputWrapperProps> = ({
    value,
    onChange,
    state,
    attribute,
    fieldValue,
    handleSubmit,
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

    const _resetToInheritedValue = () => {
        setHasChanged(false);
        onChange(state.inheritedValue.raw_value);
        handleSubmit('', state.attribute.id);
    };

    const _handleOnBlur = (event: FocusEvent<HTMLInputElement>) => {
        const valueToSubmit = event.target.value;
        if (valueToSubmit === '' && state.isInheritedValue) {
            _resetToInheritedValue();
            return;
        }
        if (hasChanged || !state.isInheritedValue) {
            handleSubmit(valueToSubmit, state.attribute.id);
        }
        onChange(event);
    };

    const _handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        setHasChanged(true);
        const inputValue = event.target.value;
        if (state.isInheritedValue && inputValue === '' && event.type === 'click') {
            _resetToInheritedValue();
            return;
        }
        onChange(event);
    };

    const label = localizedTranslation(state.formElement.settings.label, availableLang);

    return (
        <KitInputPasswordStyled
            data-testid="kit-input-password"
            label={label}
            required={state.formElement.settings.required}
            status={errors.length > 0 ? 'error' : undefined}
            onInfoClick={shouldShowValueDetailsButton ? onValueDetailsButtonClick : null}
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
