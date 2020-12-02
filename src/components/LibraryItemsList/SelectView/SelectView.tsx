// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AppstoreFilled, DownOutlined, MenuOutlined, PlusOutlined} from '@ant-design/icons';
import {Dropdown, Menu} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';

interface IView {
    value: number;
    text: string;
    type: string;
}

const defaultViews: IView[] = [
    {value: 0, text: 'My view list 1', type: 'list'},
    {value: 1, text: 'My view list 2', type: 'list'},
    {value: 2, text: 'My view tile 3', type: 'tile'},
    {value: 3, text: 'My view list 4', type: 'list'},
    {value: 4, text: 'My view tile 5', type: 'tile'}
];

function SelectView(): JSX.Element {
    const {t} = useTranslation();

    const [views] = useState(defaultViews);
    const [currentView, setCurrentView] = useState<IView>();

    const changeView = (view: IView) => {
        setCurrentView(view);
    };

    const menu = (
        <Menu>
            {views.map(view => (
                <Menu.Item key={view.value} onClick={() => changeView(view)}>
                    {view.type === 'list' ? <MenuOutlined /> : <AppstoreFilled />} {view.text}
                </Menu.Item>
            ))}

            <Menu.Divider />
            <Menu.Item>
                <span>
                    <PlusOutlined />
                    <MenuOutlined />
                </span>
                {t('select-view.add-view-list')}
            </Menu.Item>
            <Menu.Item>
                <span>
                    <PlusOutlined />
                    <AppstoreFilled />
                </span>
                {t('select-view.add-view-tile')}
            </Menu.Item>
        </Menu>
    );

    return (
        <Dropdown overlay={menu}>
            <span>
                {currentView?.text ?? t('select-view.default-view')} <DownOutlined />
            </span>
        </Dropdown>
    );
}

export default SelectView;
