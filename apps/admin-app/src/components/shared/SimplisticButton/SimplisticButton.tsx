// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Button, ButtonProps} from 'semantic-ui-react';
import styled from 'styled-components';

const SimpleButton = styled(Button)`
    &&&,
    &&&:hover,
    &&&:focus {
        border: none;
        box-shadow: none;
        background: transparent;
        display: flex;
    }
`;

function SimplisticButton({children, ...props}: ButtonProps): JSX.Element {
    return <SimpleButton {...props}>{children}</SimpleButton>;
}

export default SimplisticButton;
