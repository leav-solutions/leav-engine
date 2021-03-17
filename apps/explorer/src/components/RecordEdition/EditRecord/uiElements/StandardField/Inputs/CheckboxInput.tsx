// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Checkbox} from 'antd';
import {CheckboxChangeEvent} from 'antd/lib/checkbox';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';
import React from 'react';

function CheckboxInput({state, value, onSubmit}: IStandardInputProps): JSX.Element {
    const _handleCheckboxChange = (e: CheckboxChangeEvent) => {
        onSubmit(String(e.target.checked));
    };
    return (
        <Checkbox
            className="nested-input"
            disabled={state.isReadOnly}
            checked={!!value}
            indeterminate={typeof value !== 'boolean'}
            onChange={_handleCheckboxChange}
        />
    );
}

export default CheckboxInput;
