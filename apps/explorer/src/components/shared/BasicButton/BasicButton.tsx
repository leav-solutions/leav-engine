// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, ButtonProps} from 'antd';
import styled from 'styled-components';
import themingVar from 'themingVar';

const StyledBtn = styled(Button)<{$bordered?: boolean}>`
    && {
        color: ${themingVar['@leav-secondary-font-color']};
        &,
        &:hover,
        &[disabled] {
            background: transparent;
        }
        text-align: left;

        ${props => (!props.$bordered ? '&, &:hover {border: 0;}' : '')}
    }
`;

interface IBasicButtonProps extends ButtonProps {
    bordered?: boolean;
}

function BasicButton({children, bordered, ...props}: IBasicButtonProps): JSX.Element {
    return (
        <StyledBtn {...props} $bordered={bordered}>
            {children}
        </StyledBtn>
    );
}

export default BasicButton;
