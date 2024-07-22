// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EditOutlined, StarFilled, StarOutlined} from '@ant-design/icons';
import {useLang} from '@leav/ui';
import {getInitials, localizedTranslation} from '@leav/utils';
import {KitAvatar, KitButton, KitImage, KitItemCard, KitTypography} from 'aristid-ds';
import EditApplicationModal, {
    IEditApplicationModalProps
} from 'components/Applications/EditApplicationModal/EditApplicationModal';
import {SyntheticEvent, useState} from 'react';
import styled from 'styled-components';
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';

import './ApplicationCard.css';

interface IApplicationCardProps {
    isFavorite?: boolean;
    application: GET_APPLICATIONS_applications_list;
    onChangeFavorite: (application: GET_APPLICATIONS_applications_list, isFavorite: boolean) => void;
}

const ClickableWrapper = styled.div`
    cursor: pointer;
`;

function ApplicationCard({application, isFavorite = false, onChangeFavorite}: IApplicationCardProps): JSX.Element {
    const {lang} = useLang();
    const [isEditAppModalOpen, setIsEditAppModalOpen] = useState(false);
    const [editAppActiveTab, setEditAppActiveTab] = useState<IEditApplicationModalProps['activeTab']>();

    const label = localizedTranslation(application.label, lang);
    const description = localizedTranslation(application.description, lang);

    const _handleClick = () => {
        window.location.assign(application.url);
    };

    const _handleOpenEditAppModal = () => {
        setIsEditAppModalOpen(true);
    };

    const _handleCloseEditAppModal = () => {
        setIsEditAppModalOpen(false);
        setEditAppActiveTab(null);
    };

    const _toggleFavorite = (e: SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onChangeFavorite(application, !isFavorite);
    };

    const initials = getInitials(label);
    const appIcon = application.icon?.whoAmI?.preview?.medium as string;
    const cover = appIcon ? (
        <KitImage
            src={appIcon}
            alt={label}
            preview={{src: String(application.icon?.whoAmI?.preview?.huge), toolbarRender: () => null}}
            style={{width: '100%', objectFit: 'scale-down', background: application?.color, padding: '3px 0'}}
        />
    ) : (
        <KitAvatar color={application?.color ?? undefined}>{initials}</KitAvatar>
    );

    const actions = [
        <KitButton className="app-card-action-button" onClick={_handleOpenEditAppModal}>
            <EditOutlined />
        </KitButton>,
        <KitButton className="app-card-action-button" onClick={_toggleFavorite}>
            {isFavorite ? <StarFilled /> : <StarOutlined />}
        </KitButton>
    ];

    return (
        <>
            <div className="app-card" data-testid={`app-card-${application.id}`}>
                <div className="app-card-icon">{cover}</div>
                <div className="app-card-actions">{actions}</div>
                <div className="app-card-data">
                    <KitTypography.Text className="app-card-title" weight="bold">
                        <ClickableWrapper onClick={_handleClick}>{label}</ClickableWrapper>
                    </KitTypography.Text>
                    <div className="app-card-description-container">
                        <KitTypography.Text size="large" className="app-card-description" color="#0b6aa0">
                            <ClickableWrapper onClick={_handleClick}>{description}</ClickableWrapper>
                        </KitTypography.Text>
                    </div>
                </div>
            </div>
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
