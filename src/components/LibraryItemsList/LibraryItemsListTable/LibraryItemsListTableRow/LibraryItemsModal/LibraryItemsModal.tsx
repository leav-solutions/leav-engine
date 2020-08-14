import {useMutation} from '@apollo/client';
import {Button, Form, Modal} from 'antd';
import React, {useRef} from 'react';
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
        <Modal
            visible={showModal}
            onCancel={closeModal}
            title="Modal"
            footer={[
                <Button type="text" onClick={closeModal}>
                    Close
                </Button>,
                <Button type="primary" onClick={triggerSubmit}>
                    Submit
                </Button>
            ]}
        >
            {values && (
                <>
                    <Form>
                        <form ref={formRef} onSubmit={handleSubmit}>
                            <Form.Item>
                                <label>Id</label>
                                <input disabled type="text" value={values?.id} />
                            </Form.Item>
                            <Form.Item>
                                <label>Label</label>
                                <input
                                    type="text"
                                    value={values?.label || ''}
                                    onChange={e => updateValues({...values, label: e.target.value})}
                                />
                            </Form.Item>
                            <h2>Preview</h2>
                            <FormPreviewsModal values={values} updateValues={updateValues} />
                        </form>
                    </Form>
                </>
            )}
        </Modal>
    );
}

export default LibraryItemsModal;
