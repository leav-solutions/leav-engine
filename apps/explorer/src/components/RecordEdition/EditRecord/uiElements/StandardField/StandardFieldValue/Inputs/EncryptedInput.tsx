// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';
import React from 'react';

function EncryptedInput({state, fieldValue, onFocus, onChange, onPressEnter}: IStandardInputProps): JSX.Element {
    const {editingValue} = fieldValue;
    const _handleChange = e => {
        onChange(e.target.value);
    };

    const _handleKeyPress = e => {
        if (e.key === 'Enter') {
            onPressEnter();
        }
    };

    return (
        <Input.Password
            className="nested-input"
            value={String(editingValue)}
            onChange={_handleChange}
            onKeyPress={_handleKeyPress}
            disabled={state.isReadOnly}
            autoFocus
            data-testid="encrypted-input"
        />
    );
}

export default EncryptedInput;
