// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LibraryDetailsFragment, LibraryPreviewsSettingsFragment, useSaveLibraryMutation} from '../../../../_gqlTypes';
import {PreviewsSettingsList} from './PreviewsSettingsList';

interface IEditLibraryPreviewsSettingsProps {
    library: LibraryDetailsFragment;
    readOnly?: boolean;
}

function EditLibraryPreviewsSettings({library, readOnly}: IEditLibraryPreviewsSettingsProps): JSX.Element {
    const [saveLibrary] = useSaveLibraryMutation();

    const _cleanPreviewsSettings = (previewsSettings: LibraryPreviewsSettingsFragment[]) => previewsSettings
            .filter(settings => !settings.system) // Don't save system settings
            .map(previewSetting => ({
                label: previewSetting.label,
                description: previewSetting.description,
                versions: {
                    background: previewSetting.versions.background,
                    density: previewSetting.versions.density,
                    sizes: previewSetting.versions.sizes
                        .filter(({name, size}) => name && size) // Remove empty sizes
                        .map(({name, size}) => ({name, size}))
                }
            }));

    const _handleChange = async (newPreviewsSettings: LibraryPreviewsSettingsFragment[]) => {
        await saveLibrary({
            variables: {
                library: {
                    id: library.id,
                    previewsSettings: _cleanPreviewsSettings(newPreviewsSettings)
                }
            }
        });
    };

    return (
        <PreviewsSettingsList
            readOnly={readOnly}
            previewsSettings={library.previewsSettings}
            onChange={_handleChange}
        />
    );
}

export default EditLibraryPreviewsSettings;
