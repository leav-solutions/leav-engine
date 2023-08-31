// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {Input, Label} from 'semantic-ui-react';

//////////////////// INTERFACES

interface ICustomMessageProps {
    index: number | undefined;
    customMessage: string;
    lang: string;
    actionId: number;
    onChangeCustomMessage?: (actionId: number, value: string, lang: string) => void;
    setBlockCard: (to: boolean) => void;
}

//////////////////// COMPONENT

function CustomMessage({
    index,
    customMessage,
    lang,
    actionId,
    onChangeCustomMessage,
    setBlockCard
}: ICustomMessageProps): JSX.Element {
    const [currentValue, setCurrentValue] = useState(customMessage ? customMessage : '');

    const _onChangeCustomMessage = (event: React.SyntheticEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        const value = target.value.toString();
        setCurrentValue(value);
        onChangeCustomMessage(actionId, value, lang);
    };

    const _onFocus = e => {
        setBlockCard(true);
    };

    const _onBlur = () => {
        setBlockCard(false);
    };

    const labelStyle: React.CSSProperties = {
        width: '60px',
        textAlign: 'center',
        fontWeight: 'bold'
    };

    return (
        <Input
            style={{marginBottom: '10px'}}
            description="text"
            fluid
            labelPosition="left"
            type="string"
            name={lang}
            placeholder=""
            value={currentValue}
            onChange={_onChangeCustomMessage}
            onFocus={_onFocus}
            onBlur={_onBlur}
        >
            <Label style={labelStyle} basic>
                {lang.toUpperCase()} :
            </Label>
            <input />
        </Input>
    );
}

export default CustomMessage;
