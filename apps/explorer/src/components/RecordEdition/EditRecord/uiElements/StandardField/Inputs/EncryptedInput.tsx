// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';
import React from 'react';

function EncryptedInput({state, value, onFocus, onChange, onSubmit}: IStandardInputProps): JSX.Element {
    const _handleChange = e => {
        onChange(e.target.value);
    };

    const _handleKeyPress = e => {
        if (e.key === 'Enter') {
            onSubmit(String(value));
        }
    };

    return state.isEditing ? (
        <Input.Password
            className="nested-input"
            value={String(value)}
            onChange={_handleChange}
            onKeyPress={_handleKeyPress}
            disabled={state.isReadOnly}
            autoFocus
            data-testid="encrypted-input"
        />
    ) : (
        <Input value={value ? '•••••••••' : ''} onFocus={onFocus} />
    );
}

export default EncryptedInput;
