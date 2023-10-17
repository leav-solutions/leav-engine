// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {theme} from 'antd';
import React from 'react';
import styled, {CSSObject} from 'styled-components';
import {AntdThemeToken} from '../../antdTheme';

interface IFieldsGroupProps {
    label?: string | React.ReactNode;
    style?: CSSObject;
    children: React.ReactNode;
}

const FieldsSet = styled.fieldset<{$themeToken: AntdThemeToken; style: CSSObject}>`
    border-radius: ${props => props.$themeToken.borderRadius}px;
    border: 1px solid ${props => props.$themeToken.colorBorderSecondary};
    padding: ${props => props.$themeToken.padding}px ${props => props.$themeToken.padding / 2}px;
    margin-bottom: ${props => props.$themeToken.padding}px;

    legend {
        border: none;
        padding: 0 0.5rem;
        margin: 0 0 0 5%;
        font-size: 1em;
        color: ${props => props.$themeToken.colorTextSecondary};
        width: auto;
    }

    ${props => props.style}
`;

function FieldsGroup({label, children, style}: IFieldsGroupProps): JSX.Element {
    const {token} = theme.useToken();
    return (
        <FieldsSet $themeToken={token} style={style}>
            {label && <legend>{label}</legend>}
            {children}
        </FieldsSet>
    );
}

export default FieldsGroup;
