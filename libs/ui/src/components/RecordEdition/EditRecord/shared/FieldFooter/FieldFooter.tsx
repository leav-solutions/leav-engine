// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {theme} from 'antd';
import {GlobalToken} from 'antd/lib/theme/interface';
import React from 'react';
import styled, {CSSObject} from 'styled-components';
import {themeVars} from '_ui/antdTheme';

interface IFieldFooterProps {
    children?: React.ReactNode;
    bordered?: boolean;
    style?: CSSObject;
}

const FooterWrapper = styled.div<{style: CSSObject; $bordered?: boolean; $themeToken: GlobalToken}>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row-reverse;
    padding: 0.25rem;
    background: ${themeVars.lightBg};
    border-radius: ${p => p.$themeToken.borderRadius}px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;

    ${props => (props.$bordered ? `border: 1px solid ${themeVars.borderColor};` : '')}

    ${props => props.style}
`;

function FieldFooter({children, bordered, style}: IFieldFooterProps): JSX.Element {
    const {token} = theme.useToken();

    return (
        <FooterWrapper style={style} $bordered={bordered} $themeToken={token}>
            {children}
        </FooterWrapper>
    );
}

export default FieldFooter;
