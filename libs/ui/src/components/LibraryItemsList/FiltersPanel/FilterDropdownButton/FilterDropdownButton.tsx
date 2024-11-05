// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined} from '@ant-design/icons';
import {Button, ButtonProps, Typography} from 'antd';
import React, {ReactNode} from 'react';

interface IFilterDropdownButtonProps extends ButtonProps {
    children?: ReactNode;
    secondary?: boolean;
}

function FilterDropdownButton({children, secondary = false, ...buttonProps}: IFilterDropdownButtonProps): JSX.Element {
    return (
        <Button icon={<DownOutlined />} type="text" style={{minWidth: '50%', padding: '0 .5em'}} {...buttonProps}>
            <Typography.Text
                ellipsis={{tooltip: true}}
                type={secondary ? 'secondary' : null}
                style={{width: 'calc(100% - 1em)'}}
            >
                {children}
            </Typography.Text>
        </Button>
    );
}

export default FilterDropdownButton;
