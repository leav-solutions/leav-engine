// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Checkbox} from 'antd';
import {CheckboxChangeEvent} from 'antd/lib/checkbox';
import {IStandardInputProps} from '_ui/components/RecordEdition/EditRecordContent/_types';

function CheckboxInput({state, fieldValue, onSubmit}: IStandardInputProps): JSX.Element {
    const _handleCheckboxChange = (e: CheckboxChangeEvent) => {
        onSubmit(String(e.target.checked));
    };

    const {value} = fieldValue;

    return (
        <Checkbox
            className="nested-input"
            disabled={state.isReadOnly}
            checked={!!value?.payload}
            indeterminate={typeof value?.payload !== 'boolean'}
            onChange={_handleCheckboxChange}
        />
    );
}

export default CheckboxInput;
