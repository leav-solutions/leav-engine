// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInputNumber} from 'aristid-ds';
import {ComponentPropsWithRef, FocusEvent, FunctionComponent, useEffect, useRef, useState} from 'react';
import {
    IStandardFieldReducerState,
    IStandardFieldValue
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form, GetRef, InputNumberProps} from 'antd';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';
import styled from 'styled-components';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';

interface IDSInputWrapperProps extends IProvidedByAntFormItem<InputNumberProps> {
    state: IStandardFieldReducerState;
    attribute: RecordFormAttributeFragment;
    fieldValue: IStandardFieldValue;
    handleSubmit: (value: string, id?: string) => void;
    handleBlur: () => void;
    shouldShowValueDetailsButton?: boolean;
}

const KitInputNumberStyled = styled(KitInputNumber)<{$shouldHighlightColor: boolean}>`
    .ant-input-number-input-wrap .ant-input-number-input {
        color: ${({$shouldHighlightColor}) =>
            $shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial'};
    }
`;

export const DSInputNumberWrapper: FunctionComponent<IDSInputWrapperProps> = ({
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
        throw Error('DSInputNumberWrapper should be used inside a antd Form.Item');
    }

    const {errors} = Form.Item.useStatus();

    const [hasChanged, setHasChanged] = useState(false);

    const inputRef = useRef<GetRef<typeof KitInputNumberStyled>>(null);

    useEffect(() => {
        if (fieldValue.isEditing && inputRef.current) {
            inputRef.current.focus(); // To automatically open the date picker
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

        if (hasChanged || (!state.isInheritedValue && !state.isCalculatedValue)) {
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
            ref={inputRef}
            status={errors.length > 0 ? 'error' : undefined}
            value={value}
            onChange={_handleOnChange}
            disabled={state.isReadOnly}
            onBlur={_handleOnBlur}
            $shouldHighlightColor={
                !hasChanged && (state.isInheritedNotOverrideValue || state.isCalculatedNotOverrideValue)
            }
        />
    );
};
