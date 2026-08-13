import ErrorDisplay from '../../../shared/ErrorDisplay';
import Loading from '../../../shared/Loading';
import {getGlobalSettingsQuery} from '../../../../queries/globalSettings/getGlobalSettingsQuery';
import {
    type GlobalSettingsInput,
    useGetGlobalSettingsQuery,
    useSaveGlobalSettingsMutation,
} from '../../../../_gqlTypes';
import CustomizationForm from './CustomizationForm';
import {type GET_GLOBAL_SETTINGS_globalSettings} from '../../../../_gqlTypes/GET_GLOBAL_SETTINGS';
import {type SAVE_GLOBAL_SETTINGS_saveGlobalSettings} from '../../../../_gqlTypes/SAVE_GLOBAL_SETTINGS';

function GeneralCustomizationTab(): JSX.Element {
    const {loading, error, data} = useGetGlobalSettingsQuery();
    const [saveGlobalSettings, {error: saveError}] = useSaveGlobalSettingsMutation({
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
