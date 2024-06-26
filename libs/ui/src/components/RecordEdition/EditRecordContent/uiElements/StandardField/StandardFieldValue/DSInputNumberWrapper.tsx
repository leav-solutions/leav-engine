// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInputNumber} from 'aristid-ds';
import {ComponentPropsWithRef, FocusEvent, FunctionComponent, ReactNode, useState} from 'react';
import {IStandardFieldReducerState} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form, InputNumberProps} from 'antd';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import styled from 'styled-components';

interface IDSInputWrapperProps extends IProvidedByAntFormItem<InputNumberProps> {
    state: IStandardFieldReducerState;
    infoButton: ReactNode;
    handleSubmit: (value: string, id?: string) => void;
}

const KitInputNumberStyled = styled(KitInputNumber)<{$shouldHighlightColor: boolean}>`
    .ant-input-number-input-wrap .ant-input-number-input {
        color: ${({$shouldHighlightColor}) =>
            $shouldHighlightColor ? 'var(--general-colors-primary-primary400)' : 'initial'};
    }

    .kit-input-wrapper-helper {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
`;

export const DSInputNumberWrapper: FunctionComponent<IDSInputWrapperProps> = ({
    state,
    value,
    infoButton,
    onChange,
    handleSubmit
}) => {
    if (!onChange) {
        throw Error('DSInputNumberWrapper should be used inside a antd Form.Item');
    }

    const {t} = useSharedTranslation();
    const {errors} = Form.Item.useStatus();
    const [hasChanged, setHasChanged] = useState(false);

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
        onChange(valueToSubmit);
    };

    const _handleOnChange: ComponentPropsWithRef<typeof KitInputNumberStyled>['onChange'] = inputValue => {
        setHasChanged(true);
        onChange(inputValue);
    };

    return (
        <KitInputNumberStyled
            label={state.formElement.settings.label}
            required={state.formElement.settings.required}
            status={errors.length > 0 ? 'error' : ''}
            helper={
                state.isInheritedOverrideValue
                    ? t('record_edition.inherited_input_helper', {
                          inheritedValue: state.inheritedValue.raw_value
                      })
                    : undefined
            }
            infoIcon={infoButton}
            onInfoClick={Boolean(infoButton) ? () => void 0 : undefined}
            value={value}
            onChange={_handleOnChange}
            disabled={state.isReadOnly}
            onBlur={_handleOnBlur}
            $shouldHighlightColor={!hasChanged && state.isInheritedNotOverrideValue}
        />
    );
};
