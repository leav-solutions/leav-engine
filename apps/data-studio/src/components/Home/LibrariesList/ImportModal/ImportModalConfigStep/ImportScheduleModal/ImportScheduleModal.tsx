// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DatePicker, Modal, Space} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {useImportReducerContext} from '../../importReducer/ImportReducerContext';
import {ISheet, SheetSettingsError} from '../../_types';
import moment from 'moment';

interface IImportScheduleModalProps {
    isModalOpen: boolean;
    scheduleDate: moment.Moment;
    onCancelImportScheduleModal: () => void;
    onValidateScheduleImport: () => void;
    onChangeScheduleDate: (date: moment.Moment) => void;
}

function ImportScheduleModal({
    isModalOpen,
    scheduleDate,
    onCancelImportScheduleModal,
    onChangeScheduleDate,
    onValidateScheduleImport
}: IImportScheduleModalProps): JSX.Element {
    const {t} = useTranslation();

    const _onChange = (d, dateString) => {
        onChangeScheduleDate(d);
    };

    const handleOk = async () => {
        onValidateScheduleImport();
    };

    const handleCancel = () => {
        onCancelImportScheduleModal();
    };

    return (
        <Modal
            title={t('import.import_schedule_title')}
            visible={isModalOpen}
            okText={t('import.import_schedule')}
            cancelText={t('global.cancel')} // FIXME:
            onOk={handleOk}
            onCancel={handleCancel}
            okButtonProps={{disabled: scheduleDate === null}}
        >
            <DatePicker defaultValue={scheduleDate} onChange={_onChange} picker="date" showTime />
        </Modal>
    );
}

export default ImportScheduleModal;
