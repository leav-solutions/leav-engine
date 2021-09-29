// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';
import React, {ChangeEvent, MutableRefObject} from 'react';

function NumberInput({state, fieldValue, onFocus, onPressEnter, onChange, inputRef}: IStandardInputProps): JSX.Element {
    const {editingValue} = fieldValue;

    const _handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(String(e.target.value));
    };

    const _handlePressEnter = () => {
        onPressEnter();
    };

    const editingValueNumber = Number(editingValue);

    return (
        <Input
            type="number"
            ref={inputRef as MutableRefObject<Input>}
            className="nested-input"
            value={isNaN(editingValueNumber) ? 0 : editingValueNumber}
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
