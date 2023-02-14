// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined, RedoOutlined} from '@ant-design/icons';
import {Button, Space} from 'antd';
import EditRecordModal from 'components/RecordEdition/EditRecordModal';
import {SelectionModeContext} from 'context';
import useSearchReducer from 'hooks/useSearchReducer';
import {useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {GET_LIBRARY_DETAIL_EXTENDED_libraries_list} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import DisplayOptions from '../DisplayOptions';
import MenuItemActions from '../MenuItemActions';
import MenuSelection from '../MenuSelection';
import MenuView from '../MenuView';
import SearchItems from '../SearchItems';
import UploadFiles from '../../UploadFiles';
import CreateDirectory from 'components/CreateDirectory';

interface IMenuItemListProps {
    library: GET_LIBRARY_DETAIL_EXTENDED_libraries_list;
    refetch?: () => void;
}

const Wrapper = styled(Space)`
    width: 100%;
`;

function MenuItemList({refetch, library}: IMenuItemListProps): JSX.Element {
    const {t} = useTranslation();
    const {state: searchState} = useSearchReducer();
    const [isRecordCreationVisible, setIsRecordCreationVisible] = useState<boolean>(false);
    const [isUploadFilesModalVisible, setIsUploadFilesModalVisible] = useState<boolean>(false);
    const [isCreateDirectoryModalVisible, setIsCreateDirectoryModalVisible] = useState<boolean>(false);

    const canCreateRecord = library.permissions.create_record;

    const selectionMode = useContext(SelectionModeContext);

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
                    <MenuItemActions />
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
