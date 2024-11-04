// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useUserData from 'hooks/useUserData';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {AiOutlineAppstore, AiOutlineDatabase, AiOutlineSetting} from 'react-icons/ai';
import {BiSpreadsheet} from 'react-icons/bi';
import {RiNodeTree} from 'react-icons/ri';
import {VscLayers} from 'react-icons/vsc';
import {Icon} from 'semantic-ui-react';
import {SemanticICONS} from 'semantic-ui-react/dist/commonjs/generic';

export interface IMenuItem {
    id: string;
    label: string;
    icon: SemanticICONS | React.ReactNode;
    iconProps?: Record<string, any>;
    protected: boolean;
}

const iconSize: {[size in IUseMenuItemsProps['size']]: string} = {
    small: '1.5rem',
    big: '3rem'
};

interface IUseMenuItemsProps {
    size: 'small' | 'big';
}

function useMenuItems({size}: IUseMenuItemsProps): IMenuItem[] {
    const userData = useUserData();
    const {t} = useTranslation();

    const menuItems: IMenuItem[] = [
        {
            id: 'libraries',
            label: t('libraries.title'),
            icon: <AiOutlineDatabase size={iconSize[size]} />,
            protected: true
        },
        {
            id: 'attributes',
            label: t('attributes.title'),
            icon: <BiSpreadsheet size={iconSize[size]} />,
            protected: true
        },
        {
            id: 'trees',
            label: t('trees.title'),
            icon: <RiNodeTree size={iconSize[size]} />,
            protected: true
        },
        {
            id: 'applications',
            label: t('applications.title'),
            icon: <AiOutlineAppstore size={iconSize[size]} />,
            protected: true
        },
        {
            id: 'version_profiles',
            label: t('version_profiles.title'),
            icon: <VscLayers size={iconSize[size]} />,
            protected: true
        },
        {
            id: 'tasks',
            label: t('tasks.title'),
            icon: <Icon name="tasks" style={{fontSize: `calc(${iconSize[size]} - 2px)`}} />,
            protected: true
        },
        {
            id: 'general',
            label: t('general.title'),
            icon: <AiOutlineSetting size={iconSize[size]} />,
            protected: false
        }
    ];

    const filteredItems = userData.permissions
        ? menuItems.filter(item => !item.protected || userData.permissions![`admin_access_${item.id}`])
        : [];

    return filteredItems;
}

export default useMenuItems;
