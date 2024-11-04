// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useState} from 'react';
import {PlusOutlined} from '@ant-design/icons';
import {Button} from 'antd';
import {LibraryBehavior} from '_ui/_gqlTypes';
import {CreateDirectory, EditRecordModal, UploadFiles} from '_ui/components';
import {IValueVersion} from '_ui/types';
import {possibleSubmitButtons} from '_ui/components/RecordEdition/_types';

interface ICreateNewRecordButtonProps {
    label: string;
    libraryBehavior: LibraryBehavior;
    libraryId: string;
    notifyNewCreation: () => void;
    valuesVersions: IValueVersion;
    canCreateAndEdit?: boolean;
}

export const CreateNewRecordButton: FunctionComponent<ICreateNewRecordButtonProps> = ({
    label,
    libraryBehavior,
    libraryId,
    notifyNewCreation,
    valuesVersions,
    canCreateAndEdit = true
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

    const _handleCreate = () => {
        notifyNewCreation();
        _handleRecordCreationClose();
    };

    const _handleCreateAndEdit = () => {
        notifyNewCreation();
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

    const submitButtons: possibleSubmitButtons = ['create'];
    if (canCreateAndEdit) {
        submitButtons.push('createAndEdit');
    }

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
                    onCreate={_handleCreate}
                    onCreateAndEdit={_handleCreateAndEdit}
                    submitButtons={submitButtons}
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
