// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorDisplay from '../../shared/ErrorDisplay';
import Loading from '../../shared/Loading';
import EditApplicationContext from '../../../context/EditApplicationContext';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';
import EditApplicationTabs from './EditApplicationTabs';
import {useGetApplicationByIdQuery} from '../../../_gqlTypes';
import {type GET_APPLICATION_BY_ID_applications_list} from '../../../_gqlTypes/GET_APPLICATION_BY_ID';

const Wrapper = styled.div`
    display: grid;
    grid-template-rows: auto 1fr;
`;

function EditApplication(): JSX.Element {
    const routerMatch = useParams();
    const {t} = useTranslation();
    const appId = routerMatch?.id ?? null;
    const isNewApp = !appId;

    const {loading, error, data} = useGetApplicationByIdQuery({
        variables: {id: appId},
        skip: isNewApp,
    });

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
    const isReadOnly =
        typeof appData?.permissions?.admin_application !== 'undefined' ? !appData.permissions.admin_application : false;

    return (
        <Wrapper>
            <EditApplicationContext.Provider
                value={{
                    application: (appData as GET_APPLICATION_BY_ID_applications_list) ?? null,
                    readonly: isReadOnly,
                }}
            >
                <EditApplicationTabs />
            </EditApplicationContext.Provider>
        </Wrapper>
    );
}

export default EditApplication;
