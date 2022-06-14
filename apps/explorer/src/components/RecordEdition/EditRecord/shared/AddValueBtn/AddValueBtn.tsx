// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined} from '@ant-design/icons';
import {Button, ButtonProps} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';

interface IAddValueBtnProps extends ButtonProps {
    bordered?: boolean;
    linkField?: boolean;
}

const StyledBtn = styled(({bordered, ...rest}: IAddValueBtnProps) => <Button {...rest} />)`
    && {
        color: ${themingVar['@leav-secondary-font-color']};
        &,
        &:hover,
        &[disabled] {
            background: transparent;
        }
        text-align: left;

        ${p => (!p.bordered ? '&, &:hover {border: 0;}' : '')}
    }
`;

function AddValueBtn({bordered = false, linkField = false, ...props}: IAddValueBtnProps): JSX.Element {
    const {t} = useTranslation();
    return (
        <StyledBtn bordered={bordered} {...props}>
            <PlusOutlined />
            {linkField ? t('record_edition.add_value_link') : t('record_edition.add_value')}
        </StyledBtn>
    );
}

export default AddValueBtn;
