// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {Form, Input, Label, TextArea} from 'semantic-ui-react';
import {useTranslation} from 'react-i18next';
import {IParam, IParamInput} from '../../../interfaces/interfaces';

//////////////////// INTERFACES

interface IParamProps {
    index: number | undefined;
    param: IParam | null;
    actionId: number;
    changeParam?: (param: IParamInput) => void;
    setBlockCard: (to: boolean) => void;
}

interface ICorrespondences {
    [key: string]: string;
}

//////////////////// COMPONENT

function Param({param, actionId, changeParam, setBlockCard, index}: IParamProps): JSX.Element {
    const {t} = useTranslation();
    const [currentValue, setCurrentValue] = useState(param ? param.value : null);

    //////////////////// COMPONENT CONSTANTS

    const correspondences: ICorrespondences = {
        float: 'number',
        integer: 'number',
        boolean: 'checkbox',
        string: 'text',
        date: 'date'
    };

    //////////////////// SETTING VALUES ON CHANGE

    const _onChange = (event: React.SyntheticEvent<HTMLInputElement> | React.FormEvent<HTMLTextAreaElement>) => {
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

    const _onFocus = e => {
        setBlockCard(true);
    };

    const _onBlur = () => {
        setBlockCard(false);
    };

    const _getRenderedElement = () => {
        if (correspondences[param.type] === 'text') {
            return (
                <Form>
                    <Label basic>
                        {param.name} - {param.description}
                    </Label>
                    <TextArea
                        style={{marginBottom: '3px'}}
                        name={param.name}
                        value={currentValue ?? ''}
                        onChange={_onChange}
                        onFocus={_onFocus}
                        onBlur={_onBlur}
                    />
                    <div>
                        {t('attributes.example')}
                        {param.helper_value}
                    </div>
                </Form>
            );
        } else {
            return (
                <>
                    <Input
                        style={{marginBottom: '3px'}}
                        description="test"
                        fluid
                        label={{basic: true, content: `${param.name}:`}}
                        labelPosition="left"
                        type={correspondences[param.type]}
                        name={param.name}
                        value={currentValue ?? ''}
                        checked={
                            correspondences[param.type] === 'checkbox' && currentValue
                                ? JSON.parse(currentValue)
                                : false
                        }
                        onChange={_onChange}
                        onFocus={_onFocus}
                        onBlur={_onBlur}
                    />
                    <div>
                        {t('attributes.example')}
                        {param.helper_value}
                    </div>
                </>
            );
        }
    };

    //////////////////// RENDER

    return <div>{param && <>{_getRenderedElement()}</>}</div>;
}

export default Param;
