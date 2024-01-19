// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DatePicker, Modal} from 'antd';
import dayjs from 'dayjs';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

interface IImportScheduleModalProps {
    isModalOpen: boolean;
    scheduleDate: dayjs.Dayjs;
    onCancelImportScheduleModal: () => void;
    onValidateScheduleImport: () => void;
    onChangeScheduleDate: (date: dayjs.Dayjs) => void;
}

function ImportScheduleModal({
    isModalOpen,
    scheduleDate,
    onCancelImportScheduleModal,
    onChangeScheduleDate,
    onValidateScheduleImport
}: IImportScheduleModalProps): JSX.Element {
    const {t} = useSharedTranslation();

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
            open={isModalOpen}
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
