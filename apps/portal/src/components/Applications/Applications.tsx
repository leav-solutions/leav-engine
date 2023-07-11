// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined} from '@ant-design/icons';
import {useQuery} from '@apollo/client';
import {ErrorDisplay, Loading, useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {FloatButton} from 'antd';
import {useApplicationsPermissions} from 'hooks/useApplicationsPermissions';
import {getApplicationsQuery} from 'queries/applications/getApplicationsQuery';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {GET_APPLICATIONS, GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';
import ApplicationsList from './ApplicationsList';
import ApplicationsSearch from './ApplicationsSearch';
import {EditApplicationModal} from './EditApplicationModal';

function Applications(): JSX.Element {
    const {t} = useTranslation();

    const hiddenApps = ['portal', 'login'];
    const {lang} = useLang();
    const {loading, error, data} = useQuery<GET_APPLICATIONS>(getApplicationsQuery, {
        onCompleted: dataRes => {
            const apps = (dataRes?.applications.list ?? []).filter(
                app => app.permissions.access_application && !hiddenApps.includes(app.id)
            );
            setApplications(apps);
        }
    });
    const {loading: permissionsLoading, canCreate, error: permissionsError} = useApplicationsPermissions();
    const [showEditApplicationModal, setShowEditApplicationModal] = useState(false);

    const allApps = data?.applications.list ?? [];
    const [applications, setApplications] = useState<GET_APPLICATIONS_applications_list[]>([]);

    if (loading || permissionsLoading) {
        return <Loading />;
    }

    if (error || permissionsError) {
        return <ErrorDisplay message={error?.message || permissionsError?.message} />;
    }

    const _handleSearch = (search: string) => {
        const filteredApps = allApps.filter(app => {
            if (!app.permissions.access_application || hiddenApps.includes(app.id)) {
                return false;
            }

            const label = localizedTranslation(app.label, lang);
            const description = localizedTranslation(app.description, lang);

            return label.match(new RegExp(search, 'i')) || description.match(new RegExp(search, 'i'));
        });
        setApplications(filteredApps);
    };

    const _handleClickCreateApplication = () => {
        setShowEditApplicationModal(true);
    };

    const _handleCloseCreateApplication = () => {
        setShowEditApplicationModal(false);
    };

    return (
        <>
            <ApplicationsSearch onSearch={_handleSearch} />
            <ApplicationsList applications={applications} />
            {canCreate && (
                <FloatButton
                    data-testid="create-app-button"
                    tooltip={t('application.create')}
                    type="primary"
                    aria-label="plus"
                    icon={<PlusOutlined />}
                    onClick={_handleClickCreateApplication}
                />
            )}
            {showEditApplicationModal && (
                <EditApplicationModal open={showEditApplicationModal} onClose={_handleCloseCreateApplication} />
            )}
        </>
    );
}

export default Applications;
