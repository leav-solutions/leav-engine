// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useUserData from 'hooks/useUserData';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Icon} from 'semantic-ui-react';
import {SemanticICONS} from 'semantic-ui-react/dist/commonjs/generic';

export interface IMenuItem {
    id: string;
    label: string;
    icon: SemanticICONS | React.ReactNode;
    protected: boolean;
}

function useMenuItems(): IMenuItem[] {
    const userData = useUserData();
    const {t} = useTranslation();

    const menuItems: IMenuItem[] = [
        {
            id: 'libraries',
            label: t('libraries.title'),
            icon: 'database',
            protected: true
        },
        {
            id: 'attributes',
            label: t('attributes.title'),
            icon: 'cubes',
            protected: true
        },
        {
            id: 'trees',
            label: t('trees.title'),
            icon: <Icon name="share alternate" rotated="clockwise" />,
            protected: true
        },
        {
            id: 'general',
            label: t('general.title'),
            icon: 'cogs',
            protected: false
        }
    ];

    const filteredItems = userData.permissions
        ? menuItems.filter(item => !item.protected || userData.permissions![`app_access_${item.id}`])
        : [];

    return filteredItems;
}

export default useMenuItems;
