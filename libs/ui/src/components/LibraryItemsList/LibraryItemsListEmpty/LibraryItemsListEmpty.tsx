// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloudUploadOutlined} from '@ant-design/icons';
import {Button, Col, Empty, Row} from 'antd';
import {FunctionComponent, useState} from 'react';
import {ImportModal} from '_ui/components/ImportModal';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {CreateNewRecordButton} from '../CreateNewRecordButton/CreateNewRecordButton';

interface ILibraryItemsListEmptyProps {
    notifyNewCreation: () => void;
}

const LibraryItemsListEmpty: FunctionComponent<ILibraryItemsListEmptyProps> = ({notifyNewCreation}) => {
    const {t} = useSharedTranslation();
    const {state: searchState} = useSearchReducer();

    const [isImportModalVisible, setIsImportModalVisible] = useState<boolean>(false);

    const _handleImportModalOpen = () => {
        setIsImportModalVisible(true);
    };

    const _handleImportModalClose = () => {
        setIsImportModalVisible(false);
    };

    // "Create and edit" on create modal is not available here as the modal will be destroyed as soon as the record is
    // created and the list refreshed. Handling this situation might be complicated and not worth the effort for a
    // pretty rare use case (creating a record from an empty library and wanting to edit it right away).
    return (
        <>
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                imageStyle={{
                    height: 60
                }}
                description={<span>{t('items_list.no_data')}.</span>}
            >
                <Row>
                    <Col span={11}>
                        <Row justify="end">
                            <Col>
                                <CreateNewRecordButton
                                    label={t('items_list.new_record')}
                                    notifyNewCreation={notifyNewCreation}
                                    libraryBehavior={searchState.library.behavior}
                                    libraryId={searchState.library.id}
                                    valuesVersions={searchState.valuesVersions}
                                    canCreateAndEdit={false}
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col span={2}>
                        <span>{t('global.or')}</span>
                    </Col>
                    <Col span={11}>
                        <Row justify="start">
                            <Col>
                                <Button
                                    type="primary"
                                    style={{
                                        width: 'fit-content'
                                    }}
                                    block
                                    icon={<CloudUploadOutlined />}
                                    className="primary-btn"
                                    onClick={_handleImportModalOpen}
                                >
                                    {t('items_list.import_data')}
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Empty>
            {isImportModalVisible && (
                <ImportModal
                    open={isImportModalVisible}
                    library={searchState.library.id}
                    onClose={_handleImportModalClose}
                />
            )}
        </>
    );
};

export default LibraryItemsListEmpty;
