// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Key, useState, type ComponentProps, type FunctionComponent} from 'react';
import {KitButton, KitSpace, KitModal, KitTree, KitIdCard, KitSwitch, useKitTheme, KitLoader} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark, faCircleInfo, faCheck} from '@fortawesome/free-solid-svg-icons';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import styled from 'styled-components';
import {ErrorDisplay} from '_ui/components/ErrorDisplay';
import {SELECT_ALL_KEY, useGetPreviewSizesData} from './useGetPreviewSizesData';

interface IGeneratePreviewsModalProps {
    open: boolean;
    libraryId: string;
    isGeneratingPreviews: boolean;
    onClose: () => void;
    onConfirm: (previewSizes: Key[], isFailedOnly: boolean) => void;
}

const StyledKitSpace = styled(KitSpace)`
    width: 100%;
`;

const StyledKitTree = styled(KitTree)`
    max-height: 448px;
    overflow-y: auto;
`;

const SettingCard = styled.div`
    padding: calc(var(--general-spacing-s) * 1px);
    border-radius: calc(var(--general-border-radius-s) * 1px);
    border: 1px solid var(--general-utilities-border);
    background: var(--general-colors-neutral-grey-100);
`;

const SettingRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: calc(var(--general-spacing-s) * 1px);

    > *:first-child {
        flex: 1;
    }
`;

export const GeneratePreviewsModal = ({
    open,
    libraryId,
    isGeneratingPreviews,
    onClose,
    onConfirm,
}: IGeneratePreviewsModalProps) => {
    const {t} = useSharedTranslation();
    const {theme} = useKitTheme();

    const [isFailedOnly, setIsFailedOnly] = useState(false);
    const [checkedPreviewSizes, setCheckedPreviewSizes] = useState<Key[]>([]);

    const {
        previewSizesTreeData,
        allPreviewSizes,
        loading: libraryPreviewsSettingsLoading,
        error: libraryPreviewsSettingsError,
    } = useGetPreviewSizesData(libraryId);

    const _handleConfirm = () => {
        onConfirm(checkedPreviewSizes, isFailedOnly);
        onClose();
    };

    const _handleClose = () => {
        onClose();
    };

    const _onPreviewSizesCheck: ComponentProps<typeof KitTree>['onCheck'] = (checked, info) => {
        if (info.node.key !== SELECT_ALL_KEY) {
            setCheckedPreviewSizes(checked as Key[]);
            return;
        }

        if (info.checked) {
            setCheckedPreviewSizes(allPreviewSizes);
        } else {
            setCheckedPreviewSizes([]);
        }
    };

    const canGeneratePreviews = checkedPreviewSizes.length > 0;

    return (
        <KitModal
            appElement={document.getElementById('root')}
            isOpen={open}
            close={_handleClose}
            title={t('explorer.generate_previews_modal.title')}
            width="656px"
            height="auto"
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
                        disabled={!canGeneratePreviews}
                        loading={isGeneratingPreviews}
                        icon={<FontAwesomeIcon icon={faCheck} />}
                        onClick={_handleConfirm}
                    >
                        {t('explorer.generate_previews_modal.generate_button')}
                    </KitButton>
                </KitSpace>
            }
        >
            {libraryPreviewsSettingsLoading && <KitLoader />}
            {libraryPreviewsSettingsError && <ErrorDisplay message={libraryPreviewsSettingsError.message} />}
            {!libraryPreviewsSettingsLoading && !libraryPreviewsSettingsError && (
                <StyledKitSpace direction="vertical" size="s">
                    <StyledKitTree
                        checkable
                        onCheck={_onPreviewSizesCheck}
                        selectable={false}
                        checkStrictly={false}
                        treeData={previewSizesTreeData}
                        defaultExpandAll
                    />
                    <SettingCard>
                        <SettingRow>
                            <KitIdCard
                                avatarProps={{
                                    shape: 'square',
                                    title: 'test',
                                    icon: (
                                        <FontAwesomeIcon
                                            icon={faCircleInfo}
                                            color="var(--general-colors-neutral-white)"
                                        />
                                    ),
                                    color: theme.colors.secondary.warning[400], // We need to use the real hex color from the theme as css variables are not supported
                                }}
                                title={t('files.conditional_processing')}
                                description={t('files.previews_generation_failed_only')}
                            />
                            <KitSwitch checked={isFailedOnly} onChange={() => setIsFailedOnly(prev => !prev)} />
                        </SettingRow>
                    </SettingCard>
                </StyledKitSpace>
            )}
        </KitModal>
    );
};
