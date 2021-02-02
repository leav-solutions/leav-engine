// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SettingOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import ChooseTableColumns from '../LibraryItemsListTable/ChooseTableColumns';

const CustomButton = styled(Button)`
    padding: 0 0.5rem;
`;

function MenuItemActions(): JSX.Element {
    const {t} = useTranslation();

    const [openChangeColumns, setOpenChangeColumns] = useState(false);

    const menu = (
        <Menu>
            <Menu.Item onClick={() => setOpenChangeColumns(true)}>
                {t('items_list.table.header-cell-menu.choose-columns')}
            </Menu.Item>
            <Menu.Item>{t('items_list.table.header-cell-menu.sort-advance')}</Menu.Item>
            <Menu.Item>{t('items_list.table.header-cell-menu.regroup')}</Menu.Item>
        </Menu>
    );

    return (
        <>
            <ChooseTableColumns openChangeColumns={openChangeColumns} setOpenChangeColumns={setOpenChangeColumns} />
            <Dropdown overlay={menu}>
                <CustomButton>
                    <SettingOutlined />
                </CustomButton>
            </Dropdown>
        </>
    );
}

export default MenuItemActions;
