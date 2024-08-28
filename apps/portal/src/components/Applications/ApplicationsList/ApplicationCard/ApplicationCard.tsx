// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {faPencil, faStar as faSolidStar} from '@fortawesome/free-solid-svg-icons';
import {faStar as faEmptyStar} from '@fortawesome/free-regular-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useLang} from '@leav/ui';
import {getInitials, localizedTranslation} from '@leav/utils';
import {KitAvatar, KitImage, KitRedirectCard} from 'aristid-ds';
import EditApplicationModal, {
    IEditApplicationModalProps
} from 'components/Applications/EditApplicationModal/EditApplicationModal';
import {ComponentProps, useState} from 'react';
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';
import {useTranslation} from 'react-i18next';

interface IApplicationCardProps {
    isFavorite?: boolean;
    application: GET_APPLICATIONS_applications_list;
    onChangeFavorite: (application: GET_APPLICATIONS_applications_list, isFavorite: boolean) => void;
}

function ApplicationCard({application, isFavorite = false, onChangeFavorite}: IApplicationCardProps): JSX.Element {
    const {lang} = useLang();
    const {t} = useTranslation();
    const [isEditAppModalOpen, setIsEditAppModalOpen] = useState(false);
    const [editAppActiveTab, setEditAppActiveTab] = useState<IEditApplicationModalProps['activeTab']>();

    const label = localizedTranslation(application.label, lang);
    const description = localizedTranslation(application.description, lang);

    const _handleClick = () => {
        window.location.assign(application.url);
    };

    const _handleOpenEditAppModal = (event: MouseEvent) => {
        event.stopPropagation();
        setIsEditAppModalOpen(true);
    };

    const _handleCloseEditAppModal = () => {
        setIsEditAppModalOpen(false);
        setEditAppActiveTab(null);
    };

    const _toggleFavorite = (event: MouseEvent) => {
        event.stopPropagation();
        onChangeFavorite(application, !isFavorite);
    };

    const initials = getInitials(label);
    const appIcon = application.icon?.whoAmI?.preview?.medium as string;
    const cover = appIcon ? (
        <KitImage
            src={appIcon}
            alt={label}
            preview={{src: String(application.icon?.whoAmI?.preview?.huge)}}
            style={{width: '100%', objectFit: 'scale-down', background: application?.color, padding: '3px 0'}}
        />
    ) : (
        <KitAvatar color={application?.color ?? undefined}>{initials}</KitAvatar>
    );

    const actions: ComponentProps<typeof KitRedirectCard>['actions'] = [
        {
            key: '1',
            label: t('application.edit'),
            icon: <FontAwesomeIcon icon={faPencil} />,
            onClick: event => _handleOpenEditAppModal(event as MouseEvent)
        },
        {
            key: '2',
            label: t(isFavorite ? 'application.favorite.remove' : 'application.favorite.add'),
            icon: <FontAwesomeIcon icon={isFavorite ? faSolidStar : faEmptyStar} />,
            onClick: event => _toggleFavorite(event as MouseEvent)
        }
    ];

    return (
        <>
            <KitRedirectCard
                title={label}
                description={description}
                icon={cover}
                onClick={_handleClick}
                actions={actions}
            />
            {isEditAppModalOpen && (
                <EditApplicationModal
                    applicationId={application.id}
                    open={isEditAppModalOpen}
                    onClose={_handleCloseEditAppModal}
                    activeTab={editAppActiveTab}
                />
            )}
        </>
    );
}

export default ApplicationCard;
