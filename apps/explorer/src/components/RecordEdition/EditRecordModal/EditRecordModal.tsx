// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import RecordCard from 'components/shared/RecordCard';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {IRecordIdentityWhoAmI, PreviewSize} from '_types/types';
import EditRecord from '../EditRecord';

interface IEditRecordModalProps {
    open: boolean;
    record: IRecordIdentityWhoAmI;
    onClose: () => void;
}

function EditRecordModal({open, record, onClose}: IEditRecordModalProps): JSX.Element {
    const {t} = useTranslation();

    return open ? (
        <div onClick={e => e.stopPropagation()} onDoubleClick={e => e.stopPropagation()}>
            <Modal
                visible={open}
                onCancel={onClose}
                destroyOnClose
                title={<RecordCard record={record} size={PreviewSize.small} />}
                cancelText={t('global.close')}
                closable
                width="60vw"
                centered
                style={{padding: 0}}
                bodyStyle={{height: 'calc(100vh - 12rem)', overflowY: 'auto'}}
                footer={[
                    <Button aria-label={t('global.close')} key="close" onClick={onClose}>
                        {t('global.close')}
                    </Button>
                ]}
                wrapProps={{onClick: (e: MouseEvent) => e.stopPropagation()}}
            >
                <EditRecord record={record} />
            </Modal>
        </div>
    ) : (
        <></>
    );
}

export default EditRecordModal;
