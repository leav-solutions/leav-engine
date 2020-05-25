import React, {useRef} from 'react';
import {Button, Form, Header, Modal} from 'semantic-ui-react';
import {IItem} from '../../../../../_types/types';
import FormPreviewsModal from './FormPreviewsModal';

interface ILibraryItemsModalProps {
    showModal: boolean;
    setShowModal: (showModal: boolean) => void;
    values: IItem;
    setValues: React.Dispatch<React.SetStateAction<IItem>>;
}

function LibraryItemsModal({showModal, setShowModal, values, setValues}: ILibraryItemsModalProps): JSX.Element {
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    const triggerSubmit = () => {
        formRef.current?.dispatchEvent(new Event('submit'));
    };

    const close = () => {
        setShowModal(false);
    };

    return (
        <Modal open={showModal} onClose={close} closeIcon>
            <Modal.Header>Modal</Modal.Header>
            <Modal.Content>
                <Form as="div">
                    <form ref={formRef} onSubmit={handleSubmit}>
                        <Form.Field>
                            <label>Id</label>
                            <input disabled type="text" value={values.id} />
                        </Form.Field>
                        <Form.Field>
                            <label>Label</label>
                            <input
                                type="text"
                                value={values.label || ''}
                                onChange={e => setValues({...values, label: e.target.value})}
                            />
                        </Form.Field>
                        <Header as="h2">Preview</Header>
                        <FormPreviewsModal values={values} setValues={setValues} />
                    </form>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button secondary onClick={close}>
                    Close
                </Button>
                <Button positive onClick={triggerSubmit}>
                    Submit
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default LibraryItemsModal;
