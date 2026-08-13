import {DatePicker, Modal} from 'antd';
import type dayjs from 'dayjs';
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
    onValidateScheduleImport,
}: IImportScheduleModalProps): JSX.Element {
    const {t} = useSharedTranslation();

    const _onChange = d => {
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
