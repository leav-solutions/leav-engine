// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloudUploadOutlined,PlusOutlined} from '@ant-design/icons';
import {Button,Col,Empty,Row} from 'antd';
import {useState} from 'react';
import {ImportModal} from '_ui/components/ImportModal';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import EditRecordModal from '_ui/components/RecordEdition/EditRecordModal';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const LibraryItemsListEmpty = () => {
    const {t} = useSharedTranslation();
    const {state: searchState} = useSearchReducer();

    const [isRecordCreationVisible, setIsRecordCreationVisible] = useState<boolean>(false);
    const [isImportModalVisible, setIsImportModalVisible] = useState<boolean>(false);

    const _handleCreateRecord = () => {
        setIsRecordCreationVisible(true);
    };

    const _handleRecordCreationClose = () => {
        setIsRecordCreationVisible(false);
    };

    const _handleImportModalOpen = () => {
        setIsImportModalVisible(true);
    };

    const _handleImportModalClose = () => {
        setIsImportModalVisible(false);
    };

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
                                <Button
                                    type="primary"
                                    block
                                    style={{
                                        width: 'fit-content'
                                    }}
                                    icon={<PlusOutlined />}
                                    className="primary-btn"
                                    onClick={_handleCreateRecord}
                                >
                                    {t('items_list.new_record')}
                                </Button>
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
            {isRecordCreationVisible && (
                <EditRecordModal
                    record={null}
                    library={searchState.library.id}
                    open={isRecordCreationVisible}
                    onClose={_handleRecordCreationClose}
                    valuesVersion={searchState.valuesVersions}
                />
            )}
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
