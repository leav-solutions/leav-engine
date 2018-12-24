import * as React from 'react';
import {Input, InputOnChangeData} from 'semantic-ui-react';

interface IPermissionSelectorProps {
    value: boolean | null;
    onChange: (permValue: boolean | null) => void;
    as: any;
    forbiddenColor: string;
    allowedColor: string;
}

function PermissionSelector({
    value,
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

    // tslint:disable-next-line:variable-name
    const WrapperType = as;

    const style: React.CSSProperties = {
        width: '100%',
        border: 'none'
    };

    const wrapperStyle: React.CSSProperties = {
        background: bgColors[inputVal],
        paddingLeft: '2em',
        paddingRight: '2em',
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
                defaultValue={inputVal}
                style={style}
                onChange={_handleChange}
                transparent
            />
        </WrapperType>
    );
}

export default PermissionSelector;
