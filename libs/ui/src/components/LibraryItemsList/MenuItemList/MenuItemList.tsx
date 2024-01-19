// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined, RedoOutlined} from '@ant-design/icons';
import {Button, Space} from 'antd';
import {useState} from 'react';
import styled from 'styled-components';
import {CreateDirectory} from '_ui/components/CreateDirectory';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import EditRecordModal from '_ui/components/RecordEdition/EditRecordModal';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {SearchMode} from '_ui/types/search';
import {LibraryBehavior} from '_ui/_gqlTypes';
import {ILibraryDetailExtended} from '_ui/_queries/libraries/getLibraryDetailExtendQuery';
import {UploadFiles} from '../../UploadFiles';
import DisplayOptions from '../DisplayOptions';
import MenuSelection from '../MenuSelection';
import MenuView from '../MenuView';
import SearchItems from '../SearchItems';

interface IMenuItemListProps {
    library: ILibraryDetailExtended;
    refetch?: () => void;
}

const Wrapper = styled(Space)`
    width: 100%;
`;

function MenuItemList({refetch, library}: IMenuItemListProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {state: searchState} = useSearchReducer();
    const [isRecordCreationVisible, setIsRecordCreationVisible] = useState<boolean>(false);
    const [isUploadFilesModalVisible, setIsUploadFilesModalVisible] = useState<boolean>(false);
    const [isCreateDirectoryModalVisible, setIsCreateDirectoryModalVisible] = useState<boolean>(false);

    const canCreateRecord = library.permissions.create_record;

    const selectionMode = searchState.mode === SearchMode.select;

    const _handleRecordCreationClose = () => {
        setIsRecordCreationVisible(false);
    };

    const _handleUploadFilesClose = () => {
        setIsUploadFilesModalVisible(false);
    };

    const _handleCreateDirectoryClose = () => {
        setIsCreateDirectoryModalVisible(false);
    };

    const _handleClickNew = () => {
        if (library.behavior === LibraryBehavior.standard) {
            setIsRecordCreationVisible(true);
        } else if (library.behavior === LibraryBehavior.files) {
            setIsUploadFilesModalVisible(true);
        } else if (library.behavior === LibraryBehavior.directories) {
            setIsCreateDirectoryModalVisible(true);
        }
    };

    return (
        <Wrapper>
            {library?.id && <MenuView library={library} />}

            <Space size="large">
                <MenuSelection />
                <SearchItems />
            </Space>

            <Space size="large">
                {!selectionMode && canCreateRecord && (
                    <Button type="primary" icon={<PlusOutlined />} className="primary-btn" onClick={_handleClickNew}>
                        {t('items_list.new')}
                    </Button>
                )}

                <Space size="small">
                    <DisplayOptions />
                    <Button icon={<RedoOutlined />} onClick={() => refetch && refetch()} />
                </Space>
            </Space>

            {isRecordCreationVisible && (
                <EditRecordModal
                    record={null}
                    library={library.id}
                    open={isRecordCreationVisible}
                    onClose={_handleRecordCreationClose}
                    valuesVersion={searchState.valuesVersions}
                />
            )}
            {isUploadFilesModalVisible && (
                <UploadFiles libraryId={library.id} multiple onClose={_handleUploadFilesClose} />
            )}
            {isCreateDirectoryModalVisible && (
                <CreateDirectory libraryId={library.id} onClose={_handleCreateDirectoryClose} />
            )}
        </Wrapper>
    );
}

export default MenuItemList;
