import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {adminPermissionsQuery, AdminPermissionsQuery} from '../../../queries/permissions/userAdminPermissions';
import AppMenu from '../AppMenu';

function MainMenu({t}: WithNamespaces) {
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

    return (
        <AdminPermissionsQuery query={adminPermissionsQuery}>
            {({data}) => {
                const filteredItems =
                    data && data.adminPermissions
                        ? menuItems.filter(item => data.adminPermissions![`admin_access_${item.id}`])
                        : [];

                return <AppMenu items={filteredItems} />;
            }}
        </AdminPermissionsQuery>
    );
}

export default withNamespaces()(MainMenu);
