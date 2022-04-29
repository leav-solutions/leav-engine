// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {getInvertColor, localizedTranslation, stringToColor} from '@leav/utils';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {useApplicationContext} from 'context/ApplicationContext';
import useLang from 'hooks/useLang';
import {getApplicationsQuery} from 'queries/applications/getApplicationsQuery';
import React from 'react';
import {Button, List, Popup} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_APPLICATIONS} from '_gqlTypes/GET_APPLICATIONS';

const AppIcon = styled.span<{color: string}>`
    display: inline-block;
    background: ${props => props.color};
    color: ${props => getInvertColor(props.color)};
    width: 2em;
    height: 2em;
    border-radius: 50%;
    margin-right: 1em;
    text-align: center;
    line-height: 2em;
`;

const AppList = styled(List)`
    max-height: 80vh;
    overflow-y: auto;
    overflow-x: hidden;
`;

const AppItem = styled(List.Item)`
    display: flex;
    padding: 0.5em 0;

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
    const currentApp = useApplicationContext();

    let content: JSX.Element;

    if (loading) {
        content = <Loading />;
    }

    if (error) {
        content = <ErrorDisplay message={error.message} />;
    }

    const apps = data?.applications?.list ?? [];

    if (!loading && !error) {
        content = (
            <AppList relaxed>
                {apps
                    .filter(app => app.id !== currentApp.id)
                    .map(app => {
                        const label = localizedTranslation(app.label, lang);
                        const description = localizedTranslation(app.description, lang);
                        const initials = label
                            .split(' ')
                            .slice(0, 2)
                            .map(word => word[0])
                            .join('')
                            .toUpperCase();

                        let endpoint = app.endpoint;
                        if (endpoint[0] !== '/') {
                            endpoint = '/' + endpoint;
                        }
                        return (
                            <AppItem as="a" href={endpoint} key={app.id}>
                                <AppIcon color={app.color ?? stringToColor(label)} className="ui avatar">
                                    {initials}
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

    return (
        <Popup
            flowing
            pinned
            on="click"
            trigger={
                <Button icon="th large" aria-label="applications" style={{boxShadow: 'none'}} basic circular inverted />
            }
            content={content}
            position="bottom right"
        />
    );
}

export default ApplicationsSwitcher;
