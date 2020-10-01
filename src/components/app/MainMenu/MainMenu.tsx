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
        ? menuItems.filter(item => userData.permissions![`admin_access_${item.id}`])
        : [];

    return (
        <AppMenu
            items={[
                ...filteredItems,
                {id: 'plugins', label: t('plugins.title')}
            ]}
        />
    );
};

export default MainMenu;
