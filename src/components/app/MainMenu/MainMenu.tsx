// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import useUserData from '../../../hooks/useUserData';
import AppMenu from '../AppMenu';

const MainMenu = (): JSX.Element => {
    const userData = useUserData();
    const {t} = useTranslation();

    const menuItems = [
        {
            id: 'libraries',
            label: t('libraries.title')
        },
        {
            id: 'attributes',
            label: t('attributes.title')
        },
        {
            id: 'trees',
            label: t('trees.title')
        },
        {
            id: 'permissions',
            label: t('permissions.title')
        }
    ];

    const filteredItems = userData.permissions
        ? menuItems.filter(item => userData.permissions![`app_access_${item.id}`])
        : [];

    return <AppMenu items={[...filteredItems, {id: 'plugins', label: t('plugins.title')}]} />;
};

export default MainMenu;
