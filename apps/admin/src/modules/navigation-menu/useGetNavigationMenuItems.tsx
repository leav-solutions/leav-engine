import {type ComponentProps} from 'react';
import {useTranslation} from 'react-i18next';
import useUserData from '../../hooks/useUserData';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faBook,
    faBorderAll,
    faClockRotateLeft,
    faFolderTree,
    faGear,
    faLayerGroup,
    faListCheck,
    faRectangleList,
    faSliders,
} from '@fortawesome/free-solid-svg-icons';
import {type KitSideMenu} from 'aristid-ds';

export const useGetNavigationMenuItems = () => {
    const userData = useUserData();
    const {t} = useTranslation();

    const menuItems: ComponentProps<typeof KitSideMenu>['items'] = [
        {
            key: 'general',
            title: t('general.title'),
            icon: <FontAwesomeIcon icon={faSliders} />,
        },
        {
            key: 'libraries',
            title: t('libraries.title'),
            icon: <FontAwesomeIcon icon={faBook} />,
        },
        {
            key: 'attributes',
            title: t('attributes.title'),
            icon: <FontAwesomeIcon icon={faRectangleList} />,
        },
        {
            key: 'trees',
            title: t('trees.title'),
            icon: <FontAwesomeIcon icon={faFolderTree} />,
        },
        {
            key: 'applications',
            title: t('applications.title'),
            icon: <FontAwesomeIcon icon={faBorderAll} />,
        },
        {
            key: 'version_profiles',
            title: t('version_profiles.title'),
            icon: <FontAwesomeIcon icon={faLayerGroup} />,
        },
        {
            key: 'tasks',
            title: t('tasks.title'),
            icon: <FontAwesomeIcon icon={faListCheck} />,
        },
        {
            key: 'logs',
            title: t('logs.title'),
            icon: <FontAwesomeIcon icon={faClockRotateLeft} />,
        },
        {
            key: 'automation',
            title: t('automation.title'),
            icon: <FontAwesomeIcon icon={faGear} />,
        },
    ];

    const menuItemsAllowedByDefault = ['general'];

    const allowedMenuItems = userData.permissions
        ? menuItems.filter(
              item =>
                  menuItemsAllowedByDefault.includes(item.key) ||
                  userData.permissions![`admin_access_${item.key}`] ||
                  userData.permissions![`admin_manage_${item.key}`],
          )
        : [];

    return allowedMenuItems;
};
