import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import useUserData from '../../../hooks/useUserData';
import AppMenu from '../AppMenu';

function MainMenu({t}: WithNamespaces) {
    const userData = useUserData();

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

    return <AppMenu items={filteredItems} />;
}

export default withNamespaces()(MainMenu);
