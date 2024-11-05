// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, ButtonProps} from 'antd';
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

function BasicButton({children, bordered, centered, ...props}: IBasicButtonProps): JSX.Element {
    return (
        <StyledBtn {...props} $bordered={bordered} $centered={centered}>
            {children}
        </StyledBtn>
    );
}

export default BasicButton;
