import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Modal} from 'semantic-ui-react';
import {RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import Navigator from '../../navigator';

interface IEditRecordFormSelectRecordProps {
    open: boolean;
    library: string;
    onSelect: (record: RecordIdentity_whoAmI) => void;
    onClose: () => void;
}

const EditRecordFormSelectRecord = ({
    library,
    open,
    onClose,
    onSelect
}: IEditRecordFormSelectRecordProps): JSX.Element => {
    const {t} = useTranslation();

    return (
        <Modal open={open} onClose={onClose}>
            <Modal.Header>{t('records.select_record')}</Modal.Header>
            <Navigator onEditRecordClick={onSelect} restrictToRoots={[library]} />
            <Modal.Actions>
                <Button data-test-id="select-record-modal-close-btn" onClick={onClose}>
                    {t('admin.cancel')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

export default EditRecordFormSelectRecord;
