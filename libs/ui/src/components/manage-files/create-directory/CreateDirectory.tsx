import {useState} from 'react';
import {faCheck, faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {KitButton, KitModal, KitSpace} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type ITreeNodeWithRecord} from '_ui/types/trees';
import {type CreateDirectoryMutation} from '_ui/_gqlTypes';
import {DestinationStep} from '../shared/DestinationStep';
import {FILES_WIZARD_MODAL_WIDTH, FilesWizardModal, useWizardSteps} from '../shared/FilesWizardModal';
import {useDoesFileExistAsChild} from '../shared/useDoesFileExistAsChild';
import {useFilesTreeLibraries} from '../shared/useFilesTreeLibraries';
import {type IWizardStep} from '../_types';
import {DirectoryNameStep} from './DirectoryNameStep';
import {useCreateDirectory} from './useCreateDirectory';

interface ICreateDirectoryProps {
    defaultSelectedKey?: string;
    libraryId: string;
    onClose: () => void;
    onCompleted?: (data: CreateDirectoryMutation['createDirectory']) => void;
}

function CreateDirectory({defaultSelectedKey, libraryId, onCompleted, onClose}: ICreateDirectoryProps): JSX.Element {
    const {t} = useSharedTranslation();

    const [selectedNodeKey, setSelectedNodeKey] = useState<string>(defaultSelectedKey);

    const {filesTreeId} = useFilesTreeLibraries(libraryId);
    const {doesFileExistAsChild} = useDoesFileExistAsChild(filesTreeId);
    const {currentStep, next, prev, reset: resetSteps} = useWizardSteps(defaultSelectedKey ? 1 : 0);
    const {
        directoryName,
        setDirectoryName,
        status,
        loading,
        createDirectory,
        reset: resetDirectory,
    } = useCreateDirectory({libraryId, onCompleted});

    // Not `useConfirmModal`: it forces `type: 'confirm'`, which always renders a secondary button.
    // This dialog is a plain acknowledgement, so it must offer nothing but OK.
    const _showDuplicateNameModal = () =>
        KitModal.warning({
            // `warning()` overrides it anyway, but the shared dialog type requires it
            type: 'warning',
            width: '100%',
            style: {content: {width: '90vw', maxWidth: FILES_WIZARD_MODAL_WIDTH}},
            title: t('create_directory.duplicate_modal.title'),
            content: t('create_directory.duplicate_modal.message', {directoryName}),
            okText: t('global.ok'),
        });

    const _handleClose = () => {
        resetDirectory();
        resetSteps();
        setSelectedNodeKey(defaultSelectedKey);
        onClose();
    };

    const _handleCreateClick = async () => {
        if (await doesFileExistAsChild(selectedNodeKey, directoryName)) {
            _showDuplicateNameModal();
            return;
        }

        // Keep the modal open on failure, so the error status stays readable
        if (await createDirectory(selectedNodeKey)) {
            _handleClose();
        }
    };

    const _handleSelectPath = async (node: ITreeNodeWithRecord, selected: boolean) => {
        const newSelectedNode = selected ? node : undefined;

        if (directoryName && newSelectedNode && (await doesFileExistAsChild(newSelectedNode.id, directoryName))) {
            _showDuplicateNameModal();
            return;
        }

        setSelectedNodeKey(newSelectedNode?.key);
    };

    const steps: IWizardStep[] = [
        {
            key: 'destination',
            title: t('create_directory.select_path_step_title'),
            content: (
                <DestinationStep
                    treeId={filesTreeId}
                    selectableLibraries={[libraryId]}
                    selectedNodeKey={selectedNodeKey}
                    onSelect={_handleSelectPath}
                />
            ),
        },
        {
            key: 'name',
            title: t('create_directory.choose_name_step_title'),
            content: <DirectoryNameStep value={directoryName} onChange={setDirectoryName} />,
        },
    ];

    return (
        <FilesWizardModal
            title={t('create_directory.title')}
            testId="create-directory-modal"
            steps={steps}
            currentStep={currentStep}
            status={status}
            onClose={_handleClose}
            footer={
                <KitSpace>
                    {currentStep > 0 && (
                        <KitButton
                            data-testid="prev-btn"
                            icon={<FontAwesomeIcon icon={faChevronLeft} />}
                            onClick={prev}
                        >
                            {t('create_directory.previous')}
                        </KitButton>
                    )}
                    {currentStep < steps.length - 1 && (
                        <KitButton
                            data-testid="next-btn"
                            type="primary"
                            disabled={!selectedNodeKey}
                            icon={<FontAwesomeIcon icon={faChevronRight} />}
                            onClick={next}
                        >
                            {t('create_directory.next')}
                        </KitButton>
                    )}
                    {currentStep > 0 && (
                        <KitButton
                            data-testid="create-btn"
                            type="primary"
                            loading={loading}
                            disabled={!directoryName}
                            icon={<FontAwesomeIcon icon={faCheck} />}
                            onClick={_handleCreateClick}
                        >
                            {t('create_directory.create_step_title')}
                        </KitButton>
                    )}
                </KitSpace>
            }
        />
    );
}

export default CreateDirectory;
