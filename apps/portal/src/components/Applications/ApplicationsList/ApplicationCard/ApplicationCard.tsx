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
import ApplicationCover from './ApplicationCover';

interface IApplicationCardProps {
    isFavorite?: boolean;
    application: GET_APPLICATIONS_applications_list;
    onChangeFavorite: (application: GET_APPLICATIONS_applications_list, isFavorite: boolean) => void;
}

const AppCard = styled(Card)`
    width: 200px;
    height: 200px;
    margin: 0.5rem;
    padding: 0;
    cursor: 'pointer';
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

    const _handleClick = () => {
        window.location.assign(application.url);
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

    return (
        <>
            <AppCard
                hoverable
                cover={<ApplicationCover application={application} />}
                onClick={_handleClick}
                bodyStyle={{padding: '.5em'}}
                data-testid={`app-card-${application.id}`}
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
