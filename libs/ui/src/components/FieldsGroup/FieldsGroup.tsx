// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {theme} from 'antd';
import React from 'react';
import styled from 'styled-components';
import {AntdThemeToken} from '../../antdTheme';

interface IFieldsGroupProps {
    label?: string;
    children: React.ReactNode;
}

const FieldsSet = styled.fieldset<{themeToken: AntdThemeToken}>`
    border-radius: ${props => props.themeToken.borderRadius}px;
    border: 1px solid ${props => props.themeToken.colorBorderSecondary};
    padding: ${props => props.themeToken.padding}px ${props => props.themeToken.padding / 2}px;
    margin-bottom: ${props => props.themeToken.padding}px;

    legend {
        border: none;
        padding: 0 0.5rem;
        margin: 0 0 0 5%;
        font-size: 1em;
        color: ${props => props.themeToken.colorTextSecondary};
        width: auto;
    }
`;

function FieldsGroup({label, children}: IFieldsGroupProps): JSX.Element {
    const {token} = theme.useToken();
    return (
        <FieldsSet themeToken={token}>
            {label && <legend>{label}</legend>}
            {children}
        </FieldsSet>
    );
}

export default FieldsGroup;
