// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import EditApplicationContext from 'context/EditApplicationContext';
import {getApplicationByIdQuery} from 'queries/applications/getApplicationByIdQuery';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {match} from 'react-router';
import styled from 'styled-components';
import {GET_APPLICATION_BY_ID, GET_APPLICATION_BY_IDVariables} from '_gqlTypes/GET_APPLICATION_BY_ID';
import EditApplicationTabs from './EditApplicationTabs';

export interface IEditApplicationMatchParams {
    id: string;
}

interface IEditApplicationProps {
    match?: match<IEditApplicationMatchParams>;
}

const Wrapper = styled.div`
    display: grid;
    grid-template-rows: auto 1fr;
`;

function EditApplication({match: routerMatch}: IEditApplicationProps): JSX.Element {
    const {t} = useTranslation();
    const appId = routerMatch.params?.id ?? null;
    const isNewApp = !appId;

    const {loading, error, data} = useQuery<GET_APPLICATION_BY_ID, GET_APPLICATION_BY_IDVariables>(
        getApplicationByIdQuery,
        {
            variables: {id: appId},
            skip: isNewApp
        }
    );

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!isNewApp && !data?.applications?.list.length) {
        return <ErrorDisplay message={t('applications.not_found')} />;
    }

    const appData = data?.applications?.list[0];

    return (
        <Wrapper>
            <EditApplicationContext.Provider
                value={{application: appData ?? null, readonly: !appData.permissions.admin_application}}
            >
                <EditApplicationTabs />
            </EditApplicationContext.Provider>
        </Wrapper>
    );
}

export default EditApplication;
