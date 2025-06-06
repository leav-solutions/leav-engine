// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {localizedTranslation} from '@leav/utils';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import RecordPreview from 'components/shared/RecordPreview';
import SimplisticButton from 'components/shared/SimplisticButton';
import {useCurrentApplicationContext} from 'context/CurrentApplicationContext';
import useLang from 'hooks/useLang';
import {getApplicationsQuery} from 'queries/applications/getApplicationsQuery';
import React from 'react';
import {Icon, List, Sidebar} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_APPLICATIONS} from '_gqlTypes/GET_APPLICATIONS';

const AppSidebar = styled(Sidebar)`
    background: #ffffff;
    padding: 0.5em 1em;
`;

const AppIcon = styled.span`
    width: 2em;
    height: 2em;
    margin-right: 1em;
    color: #000;
`;

const AppList = styled(List)`
    max-height: 80vh;
    overflow-y: auto;
    overflow-x: hidden;
`;

const AppItem = styled(List.Item)`
    display: flex;
    padding: 0.5em 0;
    border-bottom: 1px solid #dddddd;
    align-items: center;

    .header,
    .description {
        max-width: 450px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    .avatar {
        flex-shrink: 0;
    }

    color: #000;

    .description {
        color: #999;
    }
`;

function ApplicationsSwitcher(): JSX.Element {
    const {lang} = useLang();
    const {loading, error, data} = useQuery<GET_APPLICATIONS>(getApplicationsQuery);
    const applicationData = useCurrentApplicationContext();
    const [isSidebarVisible, setSidebarVisible] = React.useState(false);

    let content: JSX.Element;

    if (loading) {
        content = <Loading />;
    }

    if (error) {
        content = <ErrorDisplay message={error.message} />;
    }

    const apps = data?.applications?.list ?? [];

    // Hardcoded IDs for portal and login will be removed when they'll be configured
    const portalApp = apps.find(app => app.id === 'portal');
    const loginApp = apps.find(app => app.id === 'login');
    const portalLabel = localizedTranslation(portalApp?.label, lang);

    if (!loading && !error) {
        content = (
            <AppList relaxed divided>
                {!!portalApp && (
                    <AppItem as="a" href={portalApp.url} key={portalApp.id}>
                        <AppIcon className="ui avatar">
                            <Icon name="home" size="big" />
                        </AppIcon>
                        <List.Content>
                            <List.Header>{portalLabel}</List.Header>
                        </List.Content>
                    </AppItem>
                )}
                {apps
                    // Do not display current app in the list
                    // Portal and login are also filtered out.
                    .filter(
                        app =>
                            app.id !== applicationData.currentApp.id && ![portalApp?.id, loginApp?.id].includes(app.id)
                    )
                    .map(app => {
                        const label = localizedTranslation(app.label, lang);
                        const description = localizedTranslation(app.description, lang);
                        return (
                            <AppItem as="a" href={app.url} key={app.id}>
                                <AppIcon>
                                    <RecordPreview
                                        label={label}
                                        color={app.color}
                                        image={app?.icon?.whoAmI?.preview?.small as string}
                                    />
                                </AppIcon>
                                <List.Content>
                                    <List.Header>{label}</List.Header>
                                    <List.Description>{description}</List.Description>
                                </List.Content>
                            </AppItem>
                        );
                    })}
            </AppList>
        );
    }

    const _handleToggleSidebar = () => {
        setSidebarVisible(!isSidebarVisible);
    };

    const _handleHideSidebar = () => {
        setSidebarVisible(false);
    };

    return (
        <>
            <SimplisticButton
                icon="th large"
                aria-label="applications"
                style={{boxShadow: 'none', color: '#000'}}
                basic
                circular
                onClick={_handleToggleSidebar}
            />
            <AppSidebar
                animation="overlay"
                onHide={_handleHideSidebar}
                direction="right"
                width="wide"
                visible={isSidebarVisible}
            >
                {content}
            </AppSidebar>
        </>
    );
}

export default ApplicationsSwitcher;
