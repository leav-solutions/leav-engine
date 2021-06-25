// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {Button, Form, Input, Modal} from 'antd';
import {FormInstance} from 'antd/lib/form';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import React, {useRef} from 'react';
import {saveValueBatchMutation} from '../../../../graphQL/mutations/values/saveValueBatchMutation';
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

    const [saveValueBatch] = useMutation(saveValueBatchMutation);

    const handleSubmit = () => {
        saveValueBatch({
            variables: {
                library: values?.whoAmI?.library?.id,
                recordId: values?.whoAmI.id,
                version: null,
                values: [
                    {
                        attribute: 'label',
                        value: values?.whoAmI.label
                    }
                ]
            }
        });
    };

    const triggerSubmit = () => {
        formRef.current?.submit();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (values) {
            const whoAmI = {...values.whoAmI, label: e.target.value};
            updateValues({...values, whoAmI});
        }
    };

    return (
        <Modal
            visible={showModal}
            onCancel={closeModal}
            title="Modal"
            width="50rem"
            footer={[
                <Button key="close" type="text" onClick={closeModal}>
                    Close
                </Button>,
                <PrimaryBtn key="submit" onClick={triggerSubmit}>
                    Submit
                </PrimaryBtn>
            ]}
        >
            {values && (
                <>
                    <Form ref={formRef} onFinish={handleSubmit}>
                        <Form.Item label="ID" name="ID">
                            <Input disabled type="text" value={values?.whoAmI.id} />
                        </Form.Item>
                        <Form.Item label="Label">
                            <Input type="text" value={values?.whoAmI.label || ''} onChange={handleChange} />
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
