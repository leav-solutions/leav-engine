// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button} from 'antd';
import {ButtonProps} from 'antd/lib/button';
import React from 'react';
import styled from 'styled-components';
import themingVar from '../../../themingVar';

interface PrimaryBtnComp extends Omit<ButtonProps, 'type'> {}

const PrimaryBtnComp = (props: PrimaryBtnComp) => (
    <Button type="primary" {...props}>
        {props.children}
    </Button>
);

export const PrimaryBtn = styled(PrimaryBtnComp)`
    &&& {
        border: ${themingVar['@leav-primary-btn-border']};
        font-weight: 600;

        &&&&:hover {
            background: ${themingVar['@leav-primary-btn-bg-hover']};
        }

        &&&&:active {
            box-shadow: 0px 3px 6px #5858584d;
            background: ${themingVar['@leav-primary-btn-bg-hover']};
        }

        &&&&:focus {
            box-shadow: 0px 3px 6px #5858584d;
            background: ${themingVar['@btn-primary-bg']};
        }
    }
`;
