// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SettingOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import AvailableSoon from 'components/shared/AvailableSoon';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';

function MenuItemActions(): JSX.Element {
    const {t} = useTranslation();

    const [visible, setVisible] = useState<boolean>(false);

    const menu = (
        <Menu>
            <Menu.Item disabled>
                {t('items_list.table.header-cell-menu.sort-advance')}
                <AvailableSoon />
            </Menu.Item>
            <Menu.Item disabled>
                {t('items_list.table.header-cell-menu.regroup')}
                <AvailableSoon />
            </Menu.Item>
        </Menu>
    );

    const _handleVisibleChange = () => setVisible(!visible);

    return (
        <>
            <Dropdown visible={visible} onVisibleChange={_handleVisibleChange} trigger={['click']} overlay={menu}>
                <Button>
                    <SettingOutlined />
                </Button>
            </Dropdown>
        </>
    );
}

export default MenuItemActions;
