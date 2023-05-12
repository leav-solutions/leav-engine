// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon, Modal} from 'semantic-ui-react';
import {RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import {RecordEdition} from '../../../_types/records';
import RecordCard from '../../shared/RecordCard';
import EditRecord, {IEditRecordProps} from '../EditRecord/EditRecord';

interface IEditRecordModalProps extends IEditRecordProps {
    open: boolean;
    onClose: (recordIdentity?: RecordIdentity_whoAmI) => void;
}

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
            {recordId && recordIdentity && (
                <Modal.Header style={{fontSize: '1.3em'}}>
                    <RecordCard record={recordIdentity} />
                </Modal.Header>
            )}
            <Modal.Content scrolling style={{minHeight: 'calc(30vh)'}}>
                <EditRecord
                    recordId={recordId}
                    library={library}
                    version={version}
                    onIdentityUpdate={setRecordIdentity}
                    setSubmitFunc={setSubmitFuncRef}
                    inModal
                    onPostSave={onClose}
                />
            </Modal.Content>
            {!recordId && (
                <Modal.Actions>
                    <Button className="close-button" onClick={_handleClose} negative>
                        <Icon name="cancel" /> {t('admin.cancel')}
                    </Button>
                    <Button className="submit-button" onClick={submitForm} positive>
                        <Icon name="checkmark" /> {t('admin.submit')}
                    </Button>
                </Modal.Actions>
            )}
        </Modal>
    );
};

export default EditRecordModal;
