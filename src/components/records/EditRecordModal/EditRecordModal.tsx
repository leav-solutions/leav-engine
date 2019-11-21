import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon, Modal} from 'semantic-ui-react';
import {RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import {RecordEdition} from '../../../_types/records';
import RecordCard from '../../shared/RecordCard';
import EditRecordComp from '../EditRecord';
import {IEditRecordProps} from '../EditRecord/EditRecord';

interface IEditRecordModalProps extends IEditRecordProps {
    open: boolean;
    onClose: (recordIdentity?: RecordIdentity_whoAmI) => void;
}

/* tslint:disable-next-line:variable-name */
const EditRecordModal = ({open, recordId, library, version, onClose}: IEditRecordModalProps): JSX.Element => {
    const {t} = useTranslation();
    const [recordIdentity, setRecordIdentity] = useState<RecordIdentity_whoAmI>();
    const [submitFuncRef, setSubmitFuncRef] = useState<RecordEdition.FuncRef | null>(null);

    const submitForm = () => {
        if (submitFuncRef && submitFuncRef.current) {
            submitFuncRef.current();
        }
    };

    const _handleClose = () => onClose();

    return (
        <Modal
            open={open}
            onClose={_handleClose}
            size="large"
            centered
            closeOnDimmerClick
            closeOnEscape
            closeIcon
            dimmer
        >
            <Modal.Header style={{fontSize: '1.3em'}}>
                {recordId && recordIdentity && <RecordCard record={recordIdentity} />}
            </Modal.Header>
            <Modal.Content>
                <EditRecordComp
                    recordId={recordId}
                    library={library}
                    version={version}
                    onIdentityUpdate={setRecordIdentity}
                    setSubmitFunc={setSubmitFuncRef}
                    inModal
                    onPostSave={onClose}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button className="close-button" onClick={_handleClose} negative>
                    <Icon name="cancel" /> {t('admin.cancel')}
                </Button>
                <Button className="submit-button" onClick={submitForm} positive>
                    <Icon name="checkmark" /> {t('admin.submit')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

export default EditRecordModal;
