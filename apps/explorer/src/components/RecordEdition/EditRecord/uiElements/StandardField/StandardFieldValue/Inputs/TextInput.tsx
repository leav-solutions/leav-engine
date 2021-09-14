// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';
import React, {useEffect, useRef} from 'react';

function TextInput({state, fieldValue, onFocus, onChange, onPressEnter}: IStandardInputProps): JSX.Element {
    const inputRef = useRef<Input>();

    const {isEditing, editingValue} = fieldValue;

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
            onPressEnter();
        }
    };

    return (
        <Input
            key="editing"
            ref={inputRef}
            className={`field-wrapper ${editingValue ? 'has-value' : ''}`}
            value={String(editingValue)}
            onFocus={onFocus}
            onChange={_handleChange}
            onKeyPress={_handleKeyPress}
            disabled={state.isReadOnly}
            allowClear
            autoFocus
        />
    );
}

export default TextInput;
