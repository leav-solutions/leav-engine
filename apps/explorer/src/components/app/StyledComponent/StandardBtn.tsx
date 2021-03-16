// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Button, {ButtonProps} from 'antd/lib/button';
import React from 'react';
import styled from 'styled-components';
import themingVar from '../../../themingVar';

type IStandardBtnStyledProps = ButtonProps;

const StandardBtnStyled = styled(Button)`
    &&& {
        background: ${themingVar['@default-bg']};
        font-weight: 600;

        &&&&:hover,
        &&&&:active,
        &&&&:focus {
            background: ${themingVar['@default-bg']};
        }
    }
`;
export const StandardBtn = (props: IStandardBtnStyledProps) => (
    <StandardBtnStyled {...props}>{props.children}</StandardBtnStyled>
);
