import {SettingOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import ChooseTableColumns from '../LibraryItemsListTable/ChooseTableColumns';

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
                <Button>
                    <SettingOutlined />
                </Button>
            </Dropdown>
        </>
    );
}

export default MenuItemActions;
