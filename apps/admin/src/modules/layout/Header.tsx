import {KitButton, type KitDropDown, KitHeader} from 'aristid-ds';
import {type IKitAvatar} from 'aristid-ds/dist/Kit/DataDisplay/Avatar/types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faRightFromBracket, faUser} from '@fortawesome/free-solid-svg-icons';
import {type ComponentProps, type FunctionComponent} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import AppIcon from '../../components/shared/AppIcon';
import useAuth from '../../hooks/useAuth';
import useUserData from '../../hooks/useUserData';
import {ApplicationsSwitcher} from '../applications-switcher/ApplicationsSwitcher';
import {LanguageSelector} from '../switch-language/LanguageSelector';
import {header, logo} from './Header.module.css';

export const Header: FunctionComponent = () => {
    const {t} = useTranslation();
    const {logout} = useAuth();
    const userData = useUserData();

    const identity = userData?.whoAmI?.label;

    const profileMenu: ComponentProps<typeof KitDropDown>['menu'] = {
        items: [
            {
                key: 'logout',
                label: (
                    <KitButton
                        type="action"
                        icon={
                            <FontAwesomeIcon
                                icon={faRightFromBracket}
                                style={{color: 'var(--general-utilities-error-default)'}}
                            />
                        }
                    >
                        {t('admin.logout')}
                    </KitButton>
                ),
                onClick: () => logout(),
            },
        ],
    };

    const avatarProps: IKitAvatar = {
        icon: <FontAwesomeIcon icon={faUser} />,
        label: identity,
    };

    return (
        <KitHeader
            className={header}
            logo={
                <Link to="/" className={logo} title={t('admin.title')}>
                    <AppIcon size="tiny" />
                </Link>
            }
            menu={<ApplicationsSwitcher />}
            extraRight={<KitHeader.Profile menu={profileMenu} profileCardProps={{avatarProps, title: identity}} />}
            langSwitcher={<LanguageSelector />}
        />
    );
};
