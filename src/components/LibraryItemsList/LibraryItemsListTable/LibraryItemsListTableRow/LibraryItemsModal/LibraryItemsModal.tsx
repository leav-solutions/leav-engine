import {useMutation} from '@apollo/client';
import React, {useRef} from 'react';
import {Button, Form, Header, Modal} from 'semantic-ui-react';
import {saveValueBatchQuery} from '../../../../../queries/values/saveValueBatchMutation';
import {IItem} from '../../../../../_types/types';
import FormPreviewsModal from './FormPreviewsModal';

interface ILibraryItemsModalProps {
    showModal: boolean;
    closeModal: () => void;
    values?: IItem;
    updateValues: (newItem: IItem) => void;
}

function LibraryItemsModal({showModal, closeModal, values, updateValues}: ILibraryItemsModalProps): JSX.Element {
    const formRef = useRef<HTMLFormElement>(null);

    const [saveValueBatch] = useMutation(saveValueBatchQuery);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        saveValueBatch({
            variables: {
                library: values?.library?.id,
                recordId: values?.id,
                version: null,
                values: [
                    {
                        attribute: 'label',
                        value: values?.label
                    }
                ]
            }
        });
    };

    const triggerSubmit = () => {
        formRef.current?.dispatchEvent(new Event('submit'));
    };

    return (
        <Modal open={showModal} onClose={closeModal} closeIcon>
            <Modal.Header>Modal</Modal.Header>
            {values && (
                <Modal.Content>
                    <Form as="div">
                        <form ref={formRef} onSubmit={handleSubmit}>
                            <Form.Field>
                                <label>Id</label>
                                <input disabled type="text" value={values?.id} />
                            </Form.Field>
                            <Form.Field>
                                <label>Label</label>
                                <input
                                    type="text"
                                    value={values?.label || ''}
                                    onChange={e => updateValues({...values, label: e.target.value})}
                                />
                            </Form.Field>
                            <Header as="h2">Preview</Header>
                            <FormPreviewsModal values={values} updateValues={updateValues} />
                        </form>
                    </Form>
                </Modal.Content>
            )}
            <Modal.Actions>
                <Button secondary onClick={closeModal}>
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
