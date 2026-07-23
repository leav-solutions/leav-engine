import {AppstoreOutlined, ClockCircleOutlined, StarFilled} from '@ant-design/icons';
import {useMutation, useQuery} from '@apollo/client';
import {Loading} from '@leav/ui';
import {message} from 'antd';
import {KitDivider} from 'aristid-ds';
import {getUserDataQuery} from '../../../queries/userData/getUserData';
import {saveUserData} from '../../../queries/userData/saveUserData';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {type GET_APPLICATIONS_applications_list} from '../../../_gqlTypes/GET_APPLICATIONS';
import {type GET_USER_DATA, type GET_USER_DATAVariables} from '../../../_gqlTypes/GET_USER_DATA';
import {type SAVE_USER_DATA, type SAVE_USER_DATAVariables} from '../../../_gqlTypes/SAVE_USER_DATA';
import {CONSULTED_APPS_KEY, FAVORITES_APPS_KEY} from '../_constants';
import ApplicationCard from './ApplicationCard';

interface IApplicationsListProps {
    applications: GET_APPLICATIONS_applications_list[];
}

const Wrapper = styled.div`
    padding: 0.5rem;
    background: #fff;
`;

const ListWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    gap: 1rem;
`;

const dividerIconStyle = {marginRight: '0.5em'};

function ApplicationsList({applications}: IApplicationsListProps): JSX.Element {
    const {t, i18n} = useTranslation();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [consulted, setConsulted] = useState<string[]>([]);

    const {
        data: userData,
        loading: userDataLoading,
        error: userDataError,
    } = useQuery<GET_USER_DATA, GET_USER_DATAVariables>(getUserDataQuery, {
        variables: {
            keys: [FAVORITES_APPS_KEY, CONSULTED_APPS_KEY],
        },
    });

    useEffect(() => {
        if (userData?.userData) {
            setFavorites(userData.userData.data[FAVORITES_APPS_KEY] ?? []);
            setConsulted(userData.userData.data[CONSULTED_APPS_KEY] ?? []);
        }
    }, [userData]);

    useEffect(() => {
        if (userDataError) {
            message.error(t('favorites_loading_error', {message: userDataError.message}));
        }
    }, [userDataError, t]);

    const [saveFavorites] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData);

    const _handleChangeFavorite = (app: GET_APPLICATIONS_applications_list, isFavorite: boolean): void => {
        const newFavorites = [...favorites];
        if (isFavorite) {
            newFavorites.push(app.id);
        } else {
            const index = favorites.indexOf(app.id);
            if (index !== -1) {
                newFavorites.splice(index, 1);
            }
        }

        setFavorites(newFavorites);
        saveFavorites({
            variables: {
                key: FAVORITES_APPS_KEY,
                value: newFavorites,
                global: false,
            },
        });
    };

    const _isAppFavorite = (app: GET_APPLICATIONS_applications_list): boolean => favorites.includes(app.id);
    const _isAppConsulted = (app: GET_APPLICATIONS_applications_list): boolean => consulted.includes(app.id);

    const {
        favoriteApps,
        consultedApps,
        otherApps,
    }: {
        favoriteApps: GET_APPLICATIONS_applications_list[];
        consultedApps: GET_APPLICATIONS_applications_list[];
        otherApps: GET_APPLICATIONS_applications_list[];
    } = applications.reduce(
        (acc, app) => {
            if (_isAppFavorite(app)) {
                acc.favoriteApps.push(app);
            } else if (_isAppConsulted(app)) {
                acc.consultedApps.push(app);
            } else {
                acc.otherApps.push(app);
            }

            return acc;
        },
        {
            favoriteApps: [],
            consultedApps: [],
            otherApps: [],
        },
    );

    const _sortByConsultationIndex = (
        a: GET_APPLICATIONS_applications_list,
        b: GET_APPLICATIONS_applications_list,
    ): number => {
        const aIndex = consulted.indexOf(a.id);
        const bIndex = consulted.indexOf(b.id);

        if (aIndex === -1 && bIndex !== -1) {
            return 1;
        }

        return aIndex - bIndex;
    };

    const sortedFavorites = [...favoriteApps].sort(_sortByConsultationIndex);
    const sortedConsulted = [...consultedApps].sort(_sortByConsultationIndex);

    if (userDataLoading) {
        return <Loading />;
    }

    return (
        <Wrapper>
            {!!favoriteApps.length && (
                <>
                    <KitDivider titlePlacement="left">
                        <StarFilled style={dividerIconStyle} />
                        {t('favorites')}
                    </KitDivider>
                    <ListWrapper data-testid="favorites-list">
                        {sortedFavorites.map(app => (
                            <ApplicationCard
                                application={app}
                                key={app.id}
                                isFavorite={true}
                                onChangeFavorite={_handleChangeFavorite}
                            />
                        ))}
                    </ListWrapper>
                </>
            )}
            {!!consultedApps.length && (
                <>
                    <KitDivider titlePlacement="left">
                        <ClockCircleOutlined style={dividerIconStyle} />
                        {t('consulted_apps')}
                    </KitDivider>
                    <ListWrapper data-testid="consulted-list">
                        {sortedConsulted.map(app => (
                            <ApplicationCard application={app} key={app.id} onChangeFavorite={_handleChangeFavorite} />
                        ))}
                    </ListWrapper>
                </>
            )}
            {!!otherApps.length && (
                <>
                    <KitDivider titlePlacement="left">
                        <AppstoreOutlined style={dividerIconStyle} />
                        {t('other_applications')}
                    </KitDivider>
                    <ListWrapper data-testid="others-list">
                        {otherApps.map(app => (
                            <ApplicationCard application={app} key={app.id} onChangeFavorite={_handleChangeFavorite} />
                        ))}
                    </ListWrapper>
                </>
            )}
        </Wrapper>
    );
}

export default ApplicationsList;
