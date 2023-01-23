// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SettingOutlined, StarFilled, StarOutlined} from '@ant-design/icons';
import {useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {Card, Typography} from 'antd';
import {EditApplicationModal} from 'components/Applications/EditApplicationModal';
import {IEditApplicationModalProps} from 'components/Applications/EditApplicationModal/EditApplicationModal';
import {SyntheticEvent, useState} from 'react';
import styled from 'styled-components';
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';
import {ApplicationInstallStatus, ApplicationType} from '_gqlTypes/globalTypes';
import {APPS_BASE_URL} from '../../../../constants';
import ApplicationCover from './ApplicationCover';

interface IApplicationCardProps {
    isFavorite?: boolean;
    application: GET_APPLICATIONS_applications_list;
    onChangeFavorite: (application: GET_APPLICATIONS_applications_list, isFavorite: boolean) => void;
}

const AppCard = styled(Card)<{$ready: boolean}>`
    width: 200px;
    height: 200px;
    margin: 0.5rem;
    padding: 0;

    cursor: ${props => (props.$ready ? 'pointer' : 'not-allowed')};
`;

const EditIconWrapper = styled.div`
    cursor: pointer;
    position: absolute;
    top: 1em;
    left: 1em;
    display: none;

    ${AppCard}:hover & {
        display: block;
    }
`;

const FavoritesIconWrapper = styled.div<{isFavorite: boolean}>`
    position: absolute;
    top: 1em;
    right: 1em;
    display: ${props => (props.isFavorite ? 'block' : 'none')};

    ${AppCard}:hover & {
        display: block;
    }
`;

function ApplicationCard({application, isFavorite = false, onChangeFavorite}: IApplicationCardProps): JSX.Element {
    const {lang} = useLang();
    const [isEditAppModalOpen, setIsEditAppModalOpen] = useState(false);
    const [editAppActiveTab, setEditAppActiveTab] = useState<IEditApplicationModalProps['activeTab']>();

    const label = localizedTranslation(application.label, lang);
    const description = localizedTranslation(application.description, lang);
    const isAppReady =
        application.type === ApplicationType.external ||
        application.install.status === ApplicationInstallStatus.SUCCESS;

    const _handleClick = () => {
        if (isAppReady) {
            window.location.assign(application.url);
        }
    };

    const _handleOpenEditAppModal = (e: SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();

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

    const _handleInstallTagClick = (e: SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setEditAppActiveTab('install');
        setIsEditAppModalOpen(true);
    };

    return (
        <>
            <AppCard
                hoverable
                cover={<ApplicationCover application={application} onInstallTagClick={_handleInstallTagClick} />}
                onClick={_handleClick}
                bodyStyle={{padding: '.5em'}}
                data-testid={`app-card-${application.id}`}
                $ready={isAppReady}
            >
                <Card.Meta
                    title={
                        <Typography.Paragraph ellipsis={{rows: 1, tooltip: label}} style={{marginBottom: 0}}>
                            {label}
                        </Typography.Paragraph>
                    }
                    description={
                        <Typography.Paragraph ellipsis={{rows: 3, tooltip: description}} style={{marginBottom: 0}}>
                            {description}
                        </Typography.Paragraph>
                    }
                />
                <EditIconWrapper onClick={_handleOpenEditAppModal}>
                    <SettingOutlined />
                </EditIconWrapper>
                <FavoritesIconWrapper onClick={_toggleFavorite} isFavorite={isFavorite}>
                    {isFavorite ? <StarFilled /> : <StarOutlined />}
                </FavoritesIconWrapper>
            </AppCard>
            {isEditAppModalOpen && (
                <EditApplicationModal
                    appsBaseUrl={APPS_BASE_URL}
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
