// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {localizedTranslation} from '@leav/utils';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import useLang from 'hooks/useLang';
import {getApplicationsQuery} from 'queries/applications/getApplicationsQuery';
import React, {useState} from 'react';
import {GET_APPLICATIONS, GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';
import ApplicationsList from './ApplicationsList';
import ApplicationsSearch from './ApplicationsSearch';

function Applications(): JSX.Element {
    const {lang} = useLang();
    const {loading, error, data} = useQuery<GET_APPLICATIONS>(getApplicationsQuery, {
        onCompleted: dataRes => {
            const apps = (dataRes?.applications.list ?? []).filter(app => app.permissions.access_application);
            setApplications(apps);
        }
    });

    const allApps = data?.applications.list ?? [];
    const [applications, setApplications] = useState<GET_APPLICATIONS_applications_list[]>([]);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const _handleSearch = (search: string) => {
        const filteredApps = allApps.filter(app => {
            if (!app.permissions.access_application) {
                return false;
            }

            const label = localizedTranslation(app.label, lang);
            const description = localizedTranslation(app.description, lang);

            return label.match(new RegExp(search, 'i')) || description.match(new RegExp(search, 'i'));
        });
        setApplications(filteredApps);
    };

    return (
        <>
            <ApplicationsSearch onSearch={_handleSearch} />
            <ApplicationsList applications={applications} />
        </>
    );
}

export default Applications;
