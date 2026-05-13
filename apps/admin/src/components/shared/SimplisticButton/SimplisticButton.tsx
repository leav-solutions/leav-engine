import React from 'react';
import {Button, type ButtonProps} from 'semantic-ui-react';
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
