import {type ComponentProps, type FunctionComponent} from 'react';
import {KitButton, type KitDropDown, KitHeader} from 'aristid-ds';
import {LanguageSelector} from '../switch-language/LanguageSelector';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faRightFromBracket} from '@fortawesome/free-solid-svg-icons';
import {useTranslation} from 'react-i18next';
import {type IKitAvatar} from 'aristid-ds/dist/Kit/DataDisplay/Avatar/types';
import {Link} from 'react-router-dom';
import {getAssetPath} from 'utils/utils';
import {useAuth, useUser} from '_ui/hooks';

import {header, logo} from './layout.module.css';

const getUserIdentity = ({
    givenName,
    familyName,
    email
}: {
    givenName?: string;
    familyName?: string;
    email?: string;
}) => {
    const noName = !givenName && !familyName;
    return noName ? email : `${givenName} ${familyName}`;
};

export const RootHeader: FunctionComponent = () => {
    // TODO: replace auth logic with leav logic
    const {logout} = useAuth();
    const {userData} = useUser();

    const _handleLogout = () => {
        logout();
    };
    const {t} = useTranslation();


    const profileMenuContent: ComponentProps<typeof KitDropDown>['menu'] = {
        items: [
            {
                key: 'logout',
                label: (
                    <KitButton type="action" icon={<FontAwesomeIcon icon={faRightFromBracket} style={{color: 'var(--general-utilities-error-default)'}}/>}>{t('sign_out')}</KitButton>
                ),
                onClick: _handleLogout
            }
        ]
    };

    const identity = getUserIdentity({givenName: userData?.userWhoAmI?.label, familyName: '', email: ''});

    const avatarProps: IKitAvatar = {
        src: 'images/portrait.png',
        label: identity
    };

    return (
        <KitHeader
            className={header}
            logo={
                <Link to="/" className={logo}>
                    <img src={getAssetPath('logo-leavengine.svg')} alt="logo-leavengine" title="skeleton-app" />
                </Link>
            }
            profile={
                <KitHeader.Profile
                    menu={profileMenuContent}
                    profileCardProps={{avatarProps, title: identity}}
                />
            }
            langSwitcher={<LanguageSelector />}
        />
    );
};
