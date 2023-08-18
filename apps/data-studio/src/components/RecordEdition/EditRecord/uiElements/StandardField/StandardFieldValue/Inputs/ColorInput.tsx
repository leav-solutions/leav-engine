// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ColorPicker} from 'antd';
import {Color} from 'antd/es/color-picker';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';

function ColorInput({state, fieldValue, onChange, onFocus}: IStandardInputProps): JSX.Element {
    const {editingValue} = fieldValue;
    const colorValue = '#' + editingValue.toString();

    const _handleColorChange = (value: Color) => {
        onChange(value.toHex().toUpperCase());
    };
    let colorPickerStyle: React.CSSProperties = {};

    if (fieldValue.index === 0) {
        colorPickerStyle = {
            height: '54px',
            width: '100%',
            justifyContent: 'left',
            paddingTop: '14px',
            paddingLeft: '15px'
        };
    } else {
        colorPickerStyle = {
            height: '44px',
            width: '100%',
            justifyContent: 'left',
            paddingTop: '4px',
            paddingLeft: '15px'
        };
    }

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
