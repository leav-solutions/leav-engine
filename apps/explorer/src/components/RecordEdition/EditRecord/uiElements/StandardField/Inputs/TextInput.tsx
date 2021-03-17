// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';
import React, {useEffect, useRef} from 'react';

function TextInput({state, value, onFocus, onChange, onSubmit}: IStandardInputProps): JSX.Element {
    const inputRef = useRef<Input>();

    useEffect(() => {
        // Handle focusing via click on label (not standard focus via click on input)
        if (state.isEditing) {
            inputRef.current.focus();
        }
    }, [state.isEditing]);

    const _handleChange = e => {
        onChange(e.target.value);
    };

    const _handleKeyPress = e => {
        if (e.key === 'Enter') {
            onSubmit(String(value));
        }
    };

    return state.isEditing ? (
        <Input
            key="editing"
            ref={inputRef}
            className={`field-wrapper ${value ? 'has-value' : ''}`}
            value={String(value)}
            onFocus={onFocus}
            onChange={_handleChange}
            onKeyPress={_handleKeyPress}
            disabled={state.isReadOnly}
            autoFocus
        />
    ) : (
        <Input
            key="display"
            className={value ? 'has-value' : ''}
            value={String(value)}
            onFocus={onFocus}
            disabled={state.isReadOnly}
        />
    );
}

export default TextInput;
