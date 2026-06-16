import {KitEmpty, KitGrid, KitInput, KitItemList, KitRadio, KitSpace, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {useState} from 'react';
import {type IExportProfile} from '../useGetLibraryExportProfiles';

const ExportSpacer = styled(KitSpace)`
    width: 100%;
`;

const ExportTitle = styled(KitTypography.Title)`
    &.ant-typography {
        margin-bottom: 0;
    }
`;

const ExportProfileOptionGroup = styled(KitRadio.Group)`
    width: 100%;
`;

const ExportProfileOption = styled(KitRadio)`
    width: 100%;
    padding: calc(var(--general-spacing-xs) * 1px);
    border-radius: calc(var(--general-border-radius-s) * 1px);

    &.ant-radio-wrapper-checked {
        background-color: var(--general-utilities-main-light);
    }
`;

const ExportProfileInError = styled(KitEmpty)`
    .ant-empty-description .ant-space {
        width: 100%;
        word-break: break-word;
    }
`;

interface IProfilesSelectionProps {
    profiles: IExportProfile[];
    selectedProfile: string;
    setSelectedProfile: (profile: string) => void;
}

export const ProfilesSelection = ({profiles, selectedProfile, setSelectedProfile}: IProfilesSelectionProps) => {
    const {t} = useSharedTranslation();

    const [searchTerm, setSearchTerm] = useState('');

    const filteredProfiles = profiles.filter(profile => profile.label.toLowerCase().includes(searchTerm.toLowerCase()));
    const selectedProfileData = profiles.find(p => p.label === selectedProfile);

    return (
        <KitGrid.KitRow gutter={48}>
            <KitGrid.KitCol span={12}>
                <ExportSpacer direction="vertical" size="s">
                    <ExportTitle level="h4">{t('explorer.export_profile_modal.profile_label')}</ExportTitle>
                    <KitInput
                        prefix={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                        placeholder={t('explorer.export_profile_modal.search_placeholder') ?? ''}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        size="middle"
                        allowClear
                    />
                    <ExportProfileOptionGroup
                        value={selectedProfile}
                        onChange={e => setSelectedProfile(e.target.value)}
                    >
                        <ExportSpacer direction="vertical" size="xxs">
                            {filteredProfiles.map(profile => (
                                <ExportProfileOption key={profile.label} value={profile.label}>
                                    {profile.label}
                                </ExportProfileOption>
                            ))}
                        </ExportSpacer>
                    </ExportProfileOptionGroup>
                </ExportSpacer>
            </KitGrid.KitCol>
            <KitGrid.KitCol span={12}>
                <ExportSpacer direction="vertical" size="s">
                    <ExportTitle level="h4">{t('explorer.export_profile_modal.preview_label')}</ExportTitle>
                    {selectedProfileData?.error?.message && (
                        <ExportProfileInError
                            image={KitEmpty.ASSET_RESULT_ERROR}
                            title={t('explorer.export_profile_modal.error_title')}
                            description={selectedProfileData.error.message}
                        />
                    )}
                    {selectedProfileData?.columns && (
                        <ExportSpacer direction="vertical" size="xxs">
                            {selectedProfileData.columns.map(column => (
                                <KitItemList
                                    key={column.attribute}
                                    idCardProps={{
                                        title: column.columnLabel,
                                        description:
                                            column.attribute === ''
                                                ? t('explorer.export_profile_modal.empty_columns')
                                                : column.attribute,
                                    }}
                                />
                            ))}
                        </ExportSpacer>
                    )}
                </ExportSpacer>
            </KitGrid.KitCol>
        </KitGrid.KitRow>
    );
};
