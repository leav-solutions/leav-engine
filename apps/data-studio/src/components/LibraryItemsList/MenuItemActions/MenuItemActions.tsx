// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SettingOutlined} from '@ant-design/icons';
import {Button, Dropdown} from 'antd';
import AvailableSoon from 'components/shared/AvailableSoon';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

function MenuItemActions(): JSX.Element {
    const {t} = useTranslation();

    const [visible, setVisible] = useState<boolean>(false);

    const menu = {
        items: [
            {
                key: 'sort-advanced',
                disabled: true,
                label: (
                    <>
                        {t('items_list.table.header-cell-menu.sort-advance')} <AvailableSoon />
                    </>
                )
            },
            {
                key: 'regroup',
                disabled: true,
                label: (
                    <>
                        {t('items_list.table.header-cell-menu.regroup')} <AvailableSoon />
                    </>
                )
            }
        ]
    };

    const _handleOpenChange = () => setVisible(!visible);

    return (
        <>
            <Dropdown open={visible} onOpenChange={_handleOpenChange} trigger={['click']} menu={menu}>
                <Button>
                    <SettingOutlined />
                </Button>
            </Dropdown>
        </>
    );
}

export default MenuItemActions;
