import {FunctionComponent, useState} from 'react';
import {PlusOutlined} from '@ant-design/icons';
import {Button} from 'antd';
import {LibraryBehavior} from '_ui/_gqlTypes';
import {CreateDirectory, EditRecordModal, UploadFiles} from '_ui/components';
import {IValueVersion} from '_ui/types';

interface ICreateNewRecordButtonProps {
    label: string;
    libraryBehavior: LibraryBehavior;
    libraryId: string;
    notifyNewCreation: () => void;
    valuesVersions: IValueVersion;
}

export const CreateNewRecordButton: FunctionComponent<ICreateNewRecordButtonProps> = ({
    label,
    libraryBehavior,
    libraryId,
    notifyNewCreation,
    valuesVersions
}) => {
    const [isRecordCreationVisible, setIsRecordCreationVisible] = useState(false);
    const [isUploadFilesModalVisible, setIsUploadFilesModalVisible] = useState(false);
    const [isCreateDirectoryModalVisible, setIsCreateDirectoryModalVisible] = useState(false);

    const _handleRecordCreationClose = () => {
        setIsRecordCreationVisible(false);
    };

    const _handleUploadFilesClose = () => {
        setIsUploadFilesModalVisible(false);
    };

    const _handleCreateDirectoryClose = () => {
        setIsCreateDirectoryModalVisible(false);
    };

    const _handleAfterCreate = () => {
        notifyNewCreation();
        _handleRecordCreationClose();
    };

    const _handleClickNew = () => {
        switch (libraryBehavior) {
            case LibraryBehavior.standard:
                setIsRecordCreationVisible(true);
                break;
            case LibraryBehavior.files:
                setIsUploadFilesModalVisible(true);
                break;
            case LibraryBehavior.directories:
                setIsCreateDirectoryModalVisible(true);
                break;
        }
    };

    return (
        <>
            <Button type="primary" block icon={<PlusOutlined />} className="primary-btn" onClick={_handleClickNew}>
                {label}
            </Button>
            {isRecordCreationVisible && (
                <EditRecordModal
                    record={null}
                    library={libraryId}
                    open={isRecordCreationVisible}
                    onClose={_handleRecordCreationClose}
                    valuesVersion={valuesVersions}
                    afterCreate={_handleAfterCreate}
                />
            )}
            {isUploadFilesModalVisible && (
                <UploadFiles
                    libraryId={libraryId}
                    multiple
                    onClose={_handleUploadFilesClose}
                    onCompleted={notifyNewCreation}
                />
            )}
            {isCreateDirectoryModalVisible && (
                <CreateDirectory
                    libraryId={libraryId}
                    onClose={_handleCreateDirectoryClose}
                    onCompleted={notifyNewCreation}
                />
            )}
        </>
    );
};
