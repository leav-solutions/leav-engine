// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInput} from 'aristid-ds';
import {ChangeEvent, FocusEvent, FunctionComponent, ReactNode, useState} from 'react';
import {IStandardFieldReducerState} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form, InputProps} from 'antd';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

interface IDSInputWrapperProps extends IProvidedByAntFormItem<InputProps> {
    state: IStandardFieldReducerState;
    infoButton: ReactNode;
    handleSubmit: (value: string, id?: string) => void;
}

const KitInputStyled = styled(KitInput)<{$shouldHighlightColor: boolean}>`
    color: ${({$shouldHighlightColor}) =>
        $shouldHighlightColor ? 'var(--general-colors-primary-primary400)' : 'initial'};

    .kit-input-wrapper-helper {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
`;

export const DSInputWrapper: FunctionComponent<IDSInputWrapperProps> = ({
    state,
    value,
    infoButton,
    onChange,
    handleSubmit
}) => {
    const {t} = useSharedTranslation();
    const {errors} = Form.Item.useStatus();
    const form = Form.useFormInstance();
    const [hasChanged, setHasChanged] = useState(false);

    const _resetToInheritedValue = () => {
        setHasChanged(false);
        form.setFieldValue(state.attribute.id, state.inheritedValue.raw_value);
        form.validateFields();
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

    return (
        <KitInputStyled
            label={state.formElement.settings.label}
            required={state.formElement.settings.required}
            status={errors.length > 0 ? 'error' : undefined}
            infoIcon={infoButton}
            onInfoClick={Boolean(infoButton) ? () => void 0 : undefined}
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
