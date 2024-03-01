// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input, InputRef} from 'antd';
import {ChangeEvent, MutableRefObject} from 'react';
import styled from 'styled-components';
import {IStandardInputProps} from '_ui/components/RecordEdition/EditRecordContent/_types';

const StyledInput = styled(Input)`
    // Remove arrows on number input
    && {
        input {
            -moz-appearance: textfield;
            ::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
        }
    }
`;

function NumberInput({state, fieldValue, onFocus, onPressEnter, onChange, inputRef}: IStandardInputProps): JSX.Element {
    const {editingValue} = fieldValue;

    const _handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(String(e.target.value));
    };

    const _handlePressEnter = () => {
        onPressEnter();
    };

    const editingValueNumber = Number(editingValue);

    const inputValue = editingValue !== '' ? (editingValueNumber as number) : '';

    return (
        <StyledInput
            type="number"
            ref={inputRef as MutableRefObject<InputRef>}
            className="nested-input"
            value={inputValue}
            onFocus={onFocus}
            onChange={_handleNumberChange}
            onPressEnter={_handlePressEnter}
            disabled={state.isReadOnly}
            allowClear
            autoFocus
        />
    );
}

export default NumberInput;
