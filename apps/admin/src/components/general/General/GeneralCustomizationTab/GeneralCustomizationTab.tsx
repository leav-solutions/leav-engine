// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {getGlobalSettingsQuery} from 'queries/globalSettings/getGlobalSettingsQuery';
import {saveGlobalSettingsQuery} from 'queries/globalSettings/saveGlobalSettingsMutation';
import React from 'react';
import {GET_GLOBAL_SETTINGS} from '_gqlTypes/GET_GLOBAL_SETTINGS';
import {GlobalSettingsInput} from '_gqlTypes/globalTypes';
import {SAVE_GLOBAL_SETTINGS, SAVE_GLOBAL_SETTINGSVariables} from '_gqlTypes/SAVE_GLOBAL_SETTINGS';
import CustomizationForm from './CustomizationForm';

function GeneralCustomizationTab(): JSX.Element {
    const {loading, error, data} = useQuery<GET_GLOBAL_SETTINGS>(getGlobalSettingsQuery);
    const [saveGlobalSettings, {loading: saveLoading, error: saveError}] = useMutation<
        SAVE_GLOBAL_SETTINGS,
        SAVE_GLOBAL_SETTINGSVariables
    >(saveGlobalSettingsQuery, {
        update: (cache, {data: {saveGlobalSettings: savedSettings}}) => {
            cache.writeQuery({
                query: getGlobalSettingsQuery,
                data: {globalSettings: savedSettings}
            });
        }
    });

    const _handleSubmit = async (settings: GlobalSettingsInput) => {
        const savedSettings = await saveGlobalSettings({variables: {settings}});

        return savedSettings.data.saveGlobalSettings;
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const settings = data?.globalSettings;

    return (
        <>
            {saveError && <ErrorDisplay message={saveError?.message} />}
            <CustomizationForm settings={settings} onSubmit={_handleSubmit} />
        </>
    );
}

export default GeneralCustomizationTab;
