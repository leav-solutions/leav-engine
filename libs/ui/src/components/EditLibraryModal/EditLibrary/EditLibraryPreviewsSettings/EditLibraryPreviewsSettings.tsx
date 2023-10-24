// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Alert, Button, Space, Divider} from 'antd';
import {
    LibraryDetailsFragment,
    LibraryPreviewsSettingsFragment,
    useSaveLibraryMutation,
    useCancelTaskMutation
} from '../../../../_gqlTypes';
import {PreviewsSettingsList} from './PreviewsSettingsList';
import {useSharedTranslation} from '../../../../hooks/useSharedTranslation';
import {useState} from 'react';
import PreviewsGenerationModal from '../../../PreviewsGenerationModal/PreviewsGenerationModal';

interface IEditLibraryPreviewsSettingsProps {
    library: LibraryDetailsFragment;
    readOnly?: boolean;
    previews?: {
        task?: string;
        onGenerationResult: (isSuccess: boolean) => void;
    };
}

function EditLibraryPreviewsSettings({library, readOnly, previews}: IEditLibraryPreviewsSettingsProps): JSX.Element {
    const {t} = useSharedTranslation();
    const [saveLibrary] = useSaveLibraryMutation();
    const [cancelTaskMutation] = useCancelTaskMutation();
    const [displayPreviewConfirm, setDisplayPreviewConfirm] = useState(false);
    const isReadOnly = readOnly || !(library.permissions?.admin_library ?? true);

    const _handleClickGeneratePreviews = () => {
        setDisplayPreviewConfirm(true);
    };

    const _handleClosePreviewGenerationConfirm = () => {
        setDisplayPreviewConfirm(false);
    };

    const _cleanPreviewsSettings = (previewsSettings: LibraryPreviewsSettingsFragment[]) => {
        return previewsSettings
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
    };

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

    const _onCancel = async () => {
        await cancelTaskMutation({
            variables: {
                taskId: previews?.task
            }
        });
    };

    return (
        <>
            <Space style={{display: 'flex'}} direction="vertical">
                {!!previews?.task ? (
                    <Alert
                        message={'Generation de previews en cours'}
                        type="warning"
                        showIcon
                        action={
                            <Button disabled={isReadOnly} size="small" danger onClick={_onCancel}>
                                {t('global.cancel')}
                            </Button>
                        }
                    />
                ) : (
                    <Button block type="primary" onClick={_handleClickGeneratePreviews} disabled={isReadOnly}>
                        {t('libraries.previews_settings.generate')}
                    </Button>
                )}
                <Divider orientation="left">{t('libraries.previews_settings.settings')}</Divider>
                <PreviewsSettingsList
                    readOnly={readOnly}
                    previewsSettings={library.previewsSettings}
                    onChange={_handleChange}
                />
            </Space>
            {displayPreviewConfirm && (
                <PreviewsGenerationModal
                    libraryId={library.id}
                    onClose={_handleClosePreviewGenerationConfirm}
                    onResult={previews?.onGenerationResult}
                />
            )}
        </>
    );
}

export default EditLibraryPreviewsSettings;
