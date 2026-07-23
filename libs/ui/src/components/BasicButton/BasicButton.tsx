import {Button, type ButtonProps} from 'antd';
import {forwardRef} from 'react';
import styled from 'styled-components';
import {themeVars} from '../../antdTheme';

const StyledBtn = styled(Button)<{$bordered?: boolean; $centered?: boolean}>`
    && {
        color: ${themeVars.secondaryTextColor};
        box-shadow: none;
        &,
        &:hover,
        &[disabled] {
            background: transparent;
        }
        text-align: ${p => (p.$centered ? 'center' : 'left')};

        ${props => (!props.$bordered ? '&, &:hover {border: 0;}' : '')}
    }
`;

interface IBasicButtonProps extends ButtonProps {
    bordered?: boolean;
    centered?: boolean;
}

const BasicButton = forwardRef<HTMLAnchorElement | HTMLButtonElement, IBasicButtonProps>(
    ({children, bordered, centered, ...props}, ref) => (
        <StyledBtn ref={ref} {...props} $bordered={bordered} $centered={centered}>
            {children}
        </StyledBtn>
    ),
);

BasicButton.displayName = 'BasicButton';

export default BasicButton;
