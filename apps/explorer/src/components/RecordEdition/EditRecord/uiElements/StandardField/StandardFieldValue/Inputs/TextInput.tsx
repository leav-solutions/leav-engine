// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';
import React, {useEffect, useRef} from 'react';

function TextInput({state, fieldValue, onFocus, onChange, onSubmit}: IStandardInputProps): JSX.Element {
    const inputRef = useRef<Input>();

    const {isEditing, editingValue, displayValue} = fieldValue;

    useEffect(() => {
        // Handle focusing via click on label (not standard focus via click on input)
        if (isEditing) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const _handleChange = e => {
        onChange(e.target.value);
    };

    const _handleKeyPress = e => {
        if (e.key === 'Enter') {
            onSubmit(String(editingValue));
        }
    };

    return isEditing ? (
        <Input
            key="editing"
            ref={inputRef}
            className={`field-wrapper ${editingValue ? 'has-value' : ''}`}
            value={String(editingValue)}
            onFocus={onFocus}
            onChange={_handleChange}
            onKeyPress={_handleKeyPress}
            disabled={state.isReadOnly}
            autoFocus
        />
    ) : (
        <Input
            key="display"
            className={displayValue ? 'has-value' : ''}
            value={String(displayValue)}
            onFocus={onFocus}
            disabled={state.isReadOnly}
        />
    );
}

export default TextInput;
