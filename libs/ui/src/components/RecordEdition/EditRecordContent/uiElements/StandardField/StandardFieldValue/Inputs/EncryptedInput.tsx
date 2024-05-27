// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input, InputRef} from 'antd';
import {MutableRefObject} from 'react';
import {IStandardInputProps} from '_ui/components/RecordEdition/EditRecordContent/_types';

function EncryptedInput({state, fieldValue, onChange, onPressEnter, inputRef}: IStandardInputProps): JSX.Element {
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
            ref={inputRef as MutableRefObject<InputRef>}
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
