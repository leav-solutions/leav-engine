// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SettingOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import AvailableSoon from 'components/shared/AvailableSoon';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

const CustomButton = styled(Button)`
    padding: 0 0.5rem;
`;

function MenuItemActions(): JSX.Element {
    const {t} = useTranslation();

    const menu = (
        <Menu>
            <Menu.Item>
                {t('items_list.table.header-cell-menu.sort-advance')}
                <AvailableSoon />
            </Menu.Item>
            <Menu.Item>
                {t('items_list.table.header-cell-menu.regroup')}
                <AvailableSoon />
            </Menu.Item>
        </Menu>
    );

    return (
        <>
            <Dropdown overlay={menu}>
                <CustomButton>
                    <SettingOutlined />
                </CustomButton>
            </Dropdown>
        </>
    );
}

export default MenuItemActions;
