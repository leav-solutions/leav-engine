// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Button, ButtonProps} from 'semantic-ui-react';
import styled from 'styled-components';

const SimpleButton = styled(Button)`
    &&&&&&,
    &&&&&&:hover,
    &&&&&&:focus {
        border: none;
        box-shadow: none;
        padding: 0;
        margin: 0;
        background: transparent;
        display: inline-flex;
    }
`;

function SimplisticButton({children, ...props}: ButtonProps): JSX.Element {
    return <SimpleButton {...props}>{children}</SimpleButton>;
}

export default SimplisticButton;
