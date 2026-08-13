import {Modal} from 'semantic-ui-react';
import styled from 'styled-components';
import EditAttribute from '../EditAttribute';
import {type OnAttributePostSaveFunc} from '../EditAttribute/EditAttribute';

const GridContent = styled(Modal.Content)`
    &&& {
        display: grid;
    }
`;

interface IEditAttributeModalProps {
    attribute?: string;
    open: boolean;
    onClose: () => void;
    onPostSave?: OnAttributePostSaveFunc;
    redirectAfterCreate?: boolean;
}

function EditAttributeModal({
    attribute,
    open,
    onClose,
    onPostSave,
    redirectAfterCreate,
}: IEditAttributeModalProps): JSX.Element {
    return (
        <Modal
            open={open}
            size="fullscreen"
            centered
            closeOnDimmerClick
            closeOnEscape
            closeIcon
            dimmer
            className="overlay"
            onClose={onClose}
        >
            <GridContent scrolling>
                <EditAttribute
                    attributeId={attribute ?? null}
                    onPostSave={onPostSave}
                    redirectAfterCreate={redirectAfterCreate}
                />
            </GridContent>
        </Modal>
    );
}

export default EditAttributeModal;
