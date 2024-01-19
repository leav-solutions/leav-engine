// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input, InputRef} from 'antd';
import {MutableRefObject, useEffect} from 'react';
import {IStandardInputProps} from '_ui/components/RecordEdition/EditRecord/_types';

function TextInput({state, fieldValue, onFocus, onChange, onPressEnter, inputRef}: IStandardInputProps): JSX.Element {
    const {isEditing, editingValue} = fieldValue;

    useEffect(() => {
        // Handle focusing via click on label (not standard focus via click on input)
        if (isEditing) {
            (inputRef as MutableRefObject<InputRef>).current.focus();
        }
    }, [isEditing, inputRef]);

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
            ref={inputRef as MutableRefObject<InputRef>}
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
