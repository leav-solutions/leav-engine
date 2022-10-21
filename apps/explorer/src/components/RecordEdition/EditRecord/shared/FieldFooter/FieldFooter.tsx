// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import styled from 'styled-components';
import themingVar from 'themingVar';

interface IFieldFooterProps {
    children?: React.ReactNode;
    bordered?: boolean;
    style?: React.CSSProperties;
}

const FooterWrapper = styled.div<{style: React.CSSProperties; $bordered?: boolean}>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row-reverse;
    padding: 0.25rem;
    background: ${themingVar['@background-color-light']};
    border-radius: ${themingVar['@border-radius-base']};
    border-top-left-radius: 0;
    border-top-right-radius: 0;

    ${props => (props.$bordered ? `border: 1px solid ${themingVar['@border-color-base']};` : '')}

    {...style}
`;

function FieldFooter({children, bordered, style}: IFieldFooterProps): JSX.Element {
    return (
        <FooterWrapper style={style} $bordered={bordered}>
            {children}
        </FooterWrapper>
    );
}

export default FieldFooter;
