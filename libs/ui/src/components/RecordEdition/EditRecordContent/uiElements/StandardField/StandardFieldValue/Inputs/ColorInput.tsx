// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ColorPicker} from 'antd';
import {Color} from 'antd/es/color-picker';
import {IStandardInputProps} from '_ui/components/RecordEdition/EditRecordContent/_types';

// TODO: should be clean due to support with DS?
function ColorInput({state, fieldValue, onChange, onFocus}: IStandardInputProps): JSX.Element {
    const {editingValue} = fieldValue;
    const colorValue = '#' + editingValue.toString();

    const _handleColorChange = (value: Color) => {
        onChange(value.toHex().toUpperCase());
    };
    const colorPickerStyle: React.CSSProperties = {
        height: fieldValue.index ? '44px' : '54px',
        width: '100%',
        justifyContent: 'left',
        paddingTop: fieldValue.index ? '4px' : '14px',
        paddingLeft: '15px'
    };

    return (
        <ColorPicker
            showText
            disabledAlpha
            disabled={state.isReadOnly}
            value={colorValue}
            style={colorPickerStyle}
            open={fieldValue.isEditing}
            size="small"
            onChangeComplete={_handleColorChange}
            onOpenChange={onFocus}
        />
    );
}

export default ColorInput;
