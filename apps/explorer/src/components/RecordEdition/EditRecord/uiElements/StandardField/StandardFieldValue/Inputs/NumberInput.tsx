// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';
import React, {ChangeEvent} from 'react';

function NumberInput({state, fieldValue, onFocus, onSubmit, onChange}: IStandardInputProps): JSX.Element {
    const {displayValue, editingValue, isEditing} = fieldValue;

    const _handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(String(e.target.value));
    };

    const _handlePressEnter = () => {
        onSubmit(editingValue);
    };

    const editingValueNumber = Number(editingValue);

    return isEditing ? (
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
        <Input value={String(displayValue)} onFocus={onFocus} className={displayValue ? 'has-value' : ''} />
    );
}

export default NumberInput;
