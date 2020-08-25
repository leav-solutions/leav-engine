import {useMutation} from '@apollo/client';
import {Button, Form, Input, Modal} from 'antd';
import {FormInstance} from 'antd/lib/form';
import React, {useRef} from 'react';
import {saveValueBatchQuery} from '../../../../queries/values/saveValueBatchMutation';
import {IItem} from '../../../../_types/types';
import FormPreviewsModal from './FormPreviewsModal';

interface ILibraryItemsModalProps {
    showModal: boolean;
    closeModal: () => void;
    values?: IItem;
    updateValues: (newItem: IItem) => void;
}

function LibraryItemsModal({showModal, closeModal, values, updateValues}: ILibraryItemsModalProps): JSX.Element {
    const formRef = useRef<FormInstance>(null);

    const [saveValueBatch] = useMutation(saveValueBatchQuery);

    const handleSubmit = () => {
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
        formRef.current?.submit();
    };

    return (
        <Modal
            visible={showModal}
            onCancel={closeModal}
            title="Modal"
            width="50rem"
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
                    <Form ref={formRef} onFinish={handleSubmit}>
                        <Form.Item label="ID" name="ID">
                            <Input disabled type="text" value={values?.id} />
                        </Form.Item>
                        <Form.Item label="Label">
                            <Input
                                type="text"
                                value={values?.label || ''}
                                onChange={e => updateValues({...values, label: e.target.value})}
                            />
                        </Form.Item>
                        <h2>Preview</h2>
                        <FormPreviewsModal values={values} updateValues={updateValues} />
                    </Form>
                </>
            )}
        </Modal>
    );
}

export default LibraryItemsModal;
