// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import { ColorPicker } from 'antd';
import { Color } from 'antd/es/color-picker';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';

function ColorInput({state, fieldValue, onChange,onFocus}: IStandardInputProps): JSX.Element {
    const {editingValue} = fieldValue;
    const colorValue = "#" + editingValue.toString();

    const _handleColorChange = (value: Color) => {
        onChange(value.toHex().toUpperCase());
    }

    const colorPickerStyle: React.CSSProperties = {
        height:"4em",
        width:"100%",
        justifyContent: "left",
        paddingTop: "12px",
        paddingLeft: "15px"
    };

    const _handleOpenPopup = () => {
        console.log(fieldValue.isEditing);
        return fieldValue.isEditing;
    }

      return (
        <ColorPicker
            showText
            disabled={state.isReadOnly}
            value={colorValue}
            style={colorPickerStyle}
            open={fieldValue.isEditing}
            size='small'
            onChangeComplete={_handleColorChange}
            onOpenChange={onFocus}
        />
      );
}

export default ColorInput;
