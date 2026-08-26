import {useState} from 'react';
import {faCheck, faChevronLeft, faChevronRight, faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {KitButton, KitSpace} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type ITreeNodeWithRecord} from '_ui/types/trees';
import {type UploadMutation} from '_ui/_gqlTypes';
import {DestinationStep, DestinationStepTitle} from '../shared/DestinationStep';
import {FilesWizardModal, useWizardSteps} from '../shared/FilesWizardModal';
import {useFilesTreeLibraries} from '../shared/useFilesTreeLibraries';
import {type IWizardStep} from '../_types';
import {FilesSelectionStep} from './FilesSelectionStep';
import {ReplaceFileModal} from './ReplaceFileModal';
import {useCheckFilesExist} from './useCheckFilesExist';
import {useSelectedDirectoryPath} from './useSelectedDirectoryPath';
import {useUploadFiles} from './useUploadFiles';

interface IUploadFilesProps {
    defaultSelectedNode?: {id: string; recordId?: string};
    libraryId: string;
    multiple?: boolean;
    onClose: () => void;
    onCompleted?: (data: UploadMutation['upload']) => void;
}

function UploadFiles({
    defaultSelectedNode,
    libraryId,
    multiple = false,
    onCompleted,
    onClose,
}: IUploadFilesProps): JSX.Element {
    const {t} = useSharedTranslation();

    const [selectedNode, setSelectedNode] = useState<{id: string; recordId?: string}>(defaultSelectedNode);

    const {filesTreeId, directoriesLibraryId} = useFilesTreeLibraries(libraryId);
    const {currentStep, next, prev, reset: resetSteps} = useWizardSteps(defaultSelectedNode ? 1 : 0);
    const {
        files,
        status,
        errorMsg,
        loading,
        addFile,
        removeFile,
        upload,
        reset: resetUpload,
    } = useUploadFiles({libraryId, onCompleted});
    const {checkFilesExist, conflictingFilename, onDecide, onCancel} = useCheckFilesExist(filesTreeId);

    const directoryPath = useSelectedDirectoryPath(directoriesLibraryId, selectedNode?.recordId);
    const isDone = status === 'finish' || status === 'error';

    const _handleSelectPath = async (node: ITreeNodeWithRecord, selected: boolean) =>
        setSelectedNode(selected ? {id: node.id, recordId: node.record?.id} : undefined);

    const _handleUploadClick = async () => {
        const replaceDecisions = await checkFilesExist(selectedNode.id, files);

        // Cancelled from the conflict prompt: stay on the files step, nothing uploaded.
        if (!replaceDecisions) {
            return;
        }

        next();
        await upload(selectedNode.id, replaceDecisions);
    };

    const _handleClose = () => {
        resetUpload();
        resetSteps();
        setSelectedNode(defaultSelectedNode);
        onClose();
    };

    const steps: IWizardStep[] = [
        {
            key: 'destination',
            title: selectedNode ? (
                <DestinationStepTitle path={directoryPath ?? filesTreeId} />
            ) : (
                t('upload.select_path_step_title')
            ),
            content: (
                <DestinationStep
                    treeId={filesTreeId}
                    selectableLibraries={[directoriesLibraryId]}
                    selectedNodeKey={selectedNode?.id}
                    onSelect={_handleSelectPath}
                />
            ),
        },
        {
            key: 'files',
            title: t('upload.select_files_step_title'),
            content: (
                <FilesSelectionStep
                    files={files}
                    multiple={multiple}
                    disabled={status !== 'process' || loading}
                    onAdd={addFile}
                    onRemove={removeFile}
                />
            ),
        },
        {
            key: 'upload',
            title: t('upload.upload_step_title'),
            content: (
                <FilesSelectionStep
                    files={files}
                    multiple={multiple}
                    disabled={status !== 'process' || loading}
                    errorMsg={errorMsg}
                    onAdd={addFile}
                    onRemove={removeFile}
                />
            ),
        },
    ];

    return (
        <>
            <FilesWizardModal
                title={t('upload.title')}
                testId="upload-modal"
                steps={steps}
                currentStep={currentStep}
                status={status}
                onClose={_handleClose}
                footer={
                    <KitSpace>
                        {currentStep > 0 && currentStep < steps.length - 1 && (
                            <KitButton
                                data-testid="prev-btn"
                                icon={<FontAwesomeIcon icon={faChevronLeft} />}
                                onClick={prev}
                            >
                                {t('upload.previous')}
                            </KitButton>
                        )}
                        {currentStep < steps.length - 2 && (
                            <KitButton
                                data-testid="next-btn"
                                type="primary"
                                disabled={!selectedNode}
                                icon={<FontAwesomeIcon icon={faChevronRight} />}
                                onClick={next}
                            >
                                {t('upload.next')}
                            </KitButton>
                        )}
                        {(!files.length || !isDone) && currentStep >= steps.length - 2 && (
                            <KitButton
                                data-testid="upload-btn"
                                type="primary"
                                loading={loading}
                                disabled={!files.length}
                                icon={<FontAwesomeIcon icon={faCheck} />}
                                onClick={_handleUploadClick}
                            >
                                {t('upload.upload_step_title')}
                            </KitButton>
                        )}
                        {isDone && (
                            <KitButton
                                data-testid="close-btn"
                                icon={<FontAwesomeIcon icon={faXmark} />}
                                onClick={_handleClose}
                            >
                                {t('global.close')}
                            </KitButton>
                        )}
                    </KitSpace>
                }
            />
            <ReplaceFileModal filename={conflictingFilename} onDecide={onDecide} onCancel={onCancel} />
        </>
    );
}

export default UploadFiles;
