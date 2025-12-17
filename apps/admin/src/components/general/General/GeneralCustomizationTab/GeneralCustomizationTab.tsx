// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {getGlobalSettingsQuery} from 'queries/globalSettings/getGlobalSettingsQuery';
import {type GlobalSettingsInput} from '_gqlTypes/globalTypes';
import CustomizationForm from './CustomizationForm';
import {useGetGlobalSettingsQuery, useSaveGlobalSettingsMutation} from '_gqlTypes';
import {type GET_GLOBAL_SETTINGS_globalSettings} from '_gqlTypes/GET_GLOBAL_SETTINGS';
import {type SAVE_GLOBAL_SETTINGS_saveGlobalSettings} from '_gqlTypes/SAVE_GLOBAL_SETTINGS';

function GeneralCustomizationTab(): JSX.Element {
    const {loading, error, data} = useGetGlobalSettingsQuery();
    const [saveGlobalSettings, {loading: saveLoading, error: saveError}] = useSaveGlobalSettingsMutation({
        update: (cache, {data: {saveGlobalSettings: savedSettings}}) => {
            cache.writeQuery({
                query: getGlobalSettingsQuery,
                data: {globalSettings: savedSettings},
            });
        },
    });

    const _handleSubmit = async (settings: GlobalSettingsInput) => {
        const savedSettings = await saveGlobalSettings({variables: {settings}});

        return savedSettings.data.saveGlobalSettings as SAVE_GLOBAL_SETTINGS_saveGlobalSettings;
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
            <CustomizationForm settings={settings as GET_GLOBAL_SETTINGS_globalSettings} onSubmit={_handleSubmit} />
        </>
    );
}

export default GeneralCustomizationTab;
