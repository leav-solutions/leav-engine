// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';
import React, {ChangeEvent} from 'react';

function NumberInput({state, value, onFocus, onSubmit, onChange}: IStandardInputProps): JSX.Element {
    const _handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(String(e.target.value));
    };

    const _handlePressEnter = () => {
        onSubmit(value);
    };

    const editingValueNumber = Number(value);

    return state.isEditing ? (
        <Input
            type="number"
            className="nested-input"
            value={isNaN(editingValueNumber) ? 0 : editingValueNumber}
            onFocus={onFocus}
            onChange={_handleNumberChange}
            onPressEnter={_handlePressEnter}
            disabled={state.isReadOnly}
            autoFocus
        />
    ) : (
        <Input value={String(value)} onFocus={onFocus} className={value ? 'has-value' : ''} />
    );
}

export default NumberInput;
