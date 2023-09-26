// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {StarFilled, StarOutlined} from '@ant-design/icons';
import {useLang} from '@leav/ui';
import {getInitials, localizedTranslation} from '@leav/utils';
import {KitAvatar, KitButton, KitCard, KitImage} from 'aristid-ds';
import EditApplicationModal, {
    IEditApplicationModalProps
} from 'components/Applications/EditApplicationModal/EditApplicationModal';
import {SyntheticEvent, useState} from 'react';
import styled from 'styled-components';
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';

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
        />
    ) : (
        <KitAvatar shape="square" size={214}>
            {initials}
        </KitAvatar>
    );

    const actions = [<KitButton onClick={_toggleFavorite}>{isFavorite ? <StarFilled /> : <StarOutlined />}</KitButton>];

    return (
        <>
            <KitCard
                vertical
                title={<ClickableWrapper onClick={_handleClick}>{label}</ClickableWrapper>}
                description={<ClickableWrapper onClick={_handleClick}>{description}</ClickableWrapper>}
                picture={cover}
                actions={actions}
                onEdit={_handleOpenEditAppModal}
                colors={[{label: null, color: application.color}]}
                data-testid={`app-card-${application.id}`}
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
