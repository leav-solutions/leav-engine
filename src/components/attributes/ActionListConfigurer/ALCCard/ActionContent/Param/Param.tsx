import React, {useState} from 'react';
// import styled from 'styled-components';
import { Input } from 'semantic-ui-react';
import {IParam, IParamInput} from '../../../interfaces/interfaces';

/* tslint:disable-next-line:variable-name */

//////////////////// INTERFACES

interface IParamProps {
    index: number | undefined;
    param: IParam | null;
    actionId: number;
    changeParam?: (param: IParamInput) => void;
}

interface ICorrespondences {
    [key: string]: string;
}

//////////////////// COMPONENT

function Param({param, actionId, changeParam, index}: IParamProps): JSX.Element {
    const [currentValue, setCurrentValue] = useState(param ? (param.value ? param.value : param.default_value) : null);

    //////////////////// COMPONENT CONSTANTS

    const correspondences: ICorrespondences = {
        float: 'number',
        integer: 'number',
        boolean: 'checkbox',
        string: 'text',
        date: 'date'
    };

    //////////////////// SETTING VALUES ON CHANGE

    const _onChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        const value =
            param && correspondences[param.type] === 'checkbox' ? target.checked.toString() : target.value.toString();
        setCurrentValue(value);
        if (param && changeParam) {
            changeParam({actionId, paramName: param.name, value});
        }
        // e.preventDefault(); // prevent checkbox from functionning
        event.stopPropagation();
    };

    //////////////////// RENDER

    return (
        <div>
            {param && (
                <>
                    <Input
                        style={{marginBottom: '3px'}}
                        fluid
                        label={{ basic: true, content: `${param.name}:`}}
                        labelPosition='left'
                        type={correspondences[param.type]}
                        name={param.name}
                        placeholder={param.default_value}
                        value={currentValue ? currentValue : ''}
                        checked={
                            correspondences[param.type] === 'checkbox' && currentValue
                                ? JSON.parse(currentValue)
                                : false
                        }
                        onChange={_onChange}
                    />
                </>
            )}
        </div>
    );
}

export default Param;
