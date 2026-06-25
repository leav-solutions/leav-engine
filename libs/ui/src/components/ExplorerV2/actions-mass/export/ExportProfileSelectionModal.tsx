import {type FunctionComponent, useEffect, useState} from 'react';
import {KitButton, KitSpace, KitModal, KitLoader} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark, faPlay} from '@fortawesome/free-solid-svg-icons';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useGetLibraryExportProfiles} from './useGetLibraryExportProfiles';
import styled from 'styled-components';
import {NoProfiles} from './content/NoProfiles';
import {ProfilesSelection} from './content/ProfilesSelection';

interface IExportProfileSelectionModalProps {
    open: boolean;
    libraryId: string;
    isLoading?: boolean;
    onClose: () => void;
    onConfirm: (profileLabel: string) => void;
}

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

export const ExportProfileSelectionModal: FunctionComponent<IExportProfileSelectionModalProps> = ({
    open,
    libraryId,
    isLoading = false,
    onClose,
    onConfirm,
}) => {
    const {t} = useSharedTranslation();
    const [selectedProfile, setSelectedProfile] = useState('');

    const {
        profiles,
        defaultProfile,
        loading: queryLoading,
    } = useGetLibraryExportProfiles({
        libraryId,
        skip: !open,
    });

    useEffect(() => {
        if (profiles.length > 0) {
            setSelectedProfile(defaultProfile || profiles[0]?.label || '');
        }
    }, [profiles, defaultProfile]);

    const _handleConfirm = () => {
        if (selectedProfile) {
            onConfirm(selectedProfile);
            onClose();
        }
    };

    const _handleClose = () => {
        onClose();
    };

    const selectedProfileData = profiles.find(p => p.label === selectedProfile);

    const noProfiles = !queryLoading && !profiles?.length;
    const hasProfiles = !queryLoading && Boolean(profiles?.length);

    return (
        <KitModal
            appElement={document.getElementById('root')}
            isOpen={open}
            close={_handleClose}
            title={t('explorer.export_profile_modal.title')}
            height="60vh"
            width="70vw"
            closeIcon={<FontAwesomeIcon icon={faXmark} />}
            showCloseIcon
            destroyOnClose
            footer={
                <KitSpace>
                    <KitButton size="m" icon={<FontAwesomeIcon icon={faXmark} />} onClick={_handleClose}>
                        {t('global.cancel')}
                    </KitButton>
                    <KitButton
                        type="primary"
                        size="m"
                        icon={<FontAwesomeIcon icon={faPlay} />}
                        loading={isLoading}
                        disabled={!selectedProfile || !!selectedProfileData?.error || isLoading}
                        onClick={_handleConfirm}
                    >
                        {t('explorer.export_profile_modal.export_button')}
                    </KitButton>
                </KitSpace>
            }
        >
            {queryLoading && (
                <LoaderWrapper>
                    <KitLoader />
                </LoaderWrapper>
            )}
            {noProfiles && <NoProfiles />}
            {hasProfiles && (
                <ProfilesSelection
                    profiles={profiles}
                    selectedProfile={selectedProfile}
                    setSelectedProfile={setSelectedProfile}
                />
            )}
        </KitModal>
    );
};
