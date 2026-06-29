import {useTranslation} from 'react-i18next';
import {Modal} from 'semantic-ui-react';
import {type AttributeType} from '../../../_gqlTypes';
import EditAttribute from '../EditAttribute';
import {type OnAttributePostSaveFunc} from '../EditAttribute/EditAttribute';

interface IAttributeCreationModalProps {
    open: boolean;
    onPostSave: OnAttributePostSaveFunc;
    onClose: () => void;
    forcedType?: AttributeType;
}

function AttributeCreationModal({open, onPostSave, onClose, forcedType}: IAttributeCreationModalProps): JSX.Element {
    const {t} = useTranslation();
    return (
        <>
            <Modal size="large" open={open} onClose={onClose} centered closeIcon>
                <Modal.Header>{t('attributes.new')}</Modal.Header>
                <Modal.Content>
                    <EditAttribute attributeId={null} onPostSave={onPostSave} forcedType={forcedType} />
                </Modal.Content>
            </Modal>
        </>
    );
}

export default AttributeCreationModal;
