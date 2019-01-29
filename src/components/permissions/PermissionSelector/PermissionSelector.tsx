import hexToRgba from 'hex-rgba';
import * as React from 'react';
import {Input, InputOnChangeData} from 'semantic-ui-react';

interface IPermissionSelectorProps {
    value: boolean | null;
    heritValue: boolean;
    onChange: (permValue: boolean | null) => void;
    as: any;
    forbiddenColor: string;
    allowedColor: string;
}

function PermissionSelector({
    value,
    heritValue,
    as,
    onChange,
    forbiddenColor,
    allowedColor
}: IPermissionSelectorProps): JSX.Element {
    const permValToInputVal = permVal => (permVal === false ? 0 : permVal === null ? 1 : 2);
    const inputValToPermVal = {
        0: false,
        1: null,
        2: true
    };

    const bgColors = {
        0: forbiddenColor,
        1: '#FFFFFF',
        2: allowedColor
    };

    const inputVal = permValToInputVal(value);
    const bgColor = value !== null ? bgColors[inputVal] : hexToRgba(bgColors[permValToInputVal(heritValue)], 40);

    // tslint:disable-next-line:variable-name
    const WrapperType = as;

    const style: React.CSSProperties = {
        border: 'none'
    };

    const wrapperStyle: React.CSSProperties = {
        background: bgColor,
        transition: 'background 0.3s linear'
    };

    const _handleChange = (e: React.ChangeEvent, data: InputOnChangeData) => onChange(inputValToPermVal[data.value]);

    return (
        <WrapperType style={wrapperStyle}>
            <Input
                type="range"
                min="0"
                max="2"
                step="1"
                value={inputVal}
                style={style}
                onChange={_handleChange}
                transparent
                fluid
            />
        </WrapperType>
    );
}

export default PermissionSelector;
