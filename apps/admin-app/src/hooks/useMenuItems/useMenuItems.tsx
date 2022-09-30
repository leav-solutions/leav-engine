// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ValueVersionsIcon from 'components/shared/icons/ValueVersionsIcon';
import useUserData from 'hooks/useUserData';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {SemanticICONS} from 'semantic-ui-react/dist/commonjs/generic';

export interface IMenuItem {
    id: string;
    label: string;
    icon: SemanticICONS | React.ReactNode;
    iconProps?: Record<string, any>;
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
            icon: 'share alternate',
            iconProps: {
                rotated: 'clockwise'
            },
            protected: true
        },
        {
            id: 'applications',
            label: t('applications.title'),
            icon: 'th',
            protected: true
        },
        {
            id: 'version_profiles',
            label: t('version_profiles.title'),
            icon: <ValueVersionsIcon style={{justifySelf: 'center', marginTop: '4px'}} />,
            iconProps: {
                size: '1.5rem'
            },
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
        ? menuItems.filter(item => !item.protected || userData.permissions![`admin_access_${item.id}`])
        : [];

    return filteredItems;
}

export default useMenuItems;
