import React, {useRef} from 'react';
import {Button, Form, Header, Modal} from 'semantic-ui-react';
import {IItem, IPreview, PreviewAttributes} from '../../../../../_types/types';

interface ILibraryItemsModalProps {
    showModal: boolean;
    setShowModal: (showModal: boolean) => void;
    values: IItem;
    setValues: React.Dispatch<React.SetStateAction<IItem>>;
}

function LibraryItemsModal({showModal, setShowModal, values, setValues}: ILibraryItemsModalProps): JSX.Element {
    const formRef = useRef<HTMLFormElement>(null);

    const previewAttributes = Object.keys(PreviewAttributes).filter(
        previewAttribute => !(parseInt(previewAttribute) + 1)
    );

    const defaultPreview: any = {};

    for (let att of previewAttributes) {
        defaultPreview[att] = '';
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('submit');
    };

    const triggerSubmit = () => {
        formRef.current?.dispatchEvent(new Event('submit'));
    };

    return (
        <Modal open={showModal} onClose={() => setShowModal(false)} closeIcon>
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
                                value={values.label}
                                onChange={e => setValues({...values, label: e.target.value})}
                            />
                        </Form.Field>
                        <Header as="h2">Preview</Header>
                        {previewAttributes.map(previewAttribute => {
                            const att: 'small' | 'medium' | 'big' | 'pages' = previewAttribute as any;

                            return (
                                <Form.Field key={previewAttribute}>
                                    <label>{previewAttribute}</label>
                                    <input
                                        value={(values.preview && values.preview[att]) ?? ''}
                                        onChange={e =>
                                            setValues({
                                                ...values,
                                                preview: values.preview
                                                    ? {...values.preview, [previewAttribute]: e.target.value}
                                                    : {
                                                          ...(defaultPreview as IPreview),
                                                          [previewAttribute]: e.target.value
                                                      }
                                            })
                                        }
                                    />
                                </Form.Field>
                            );
                        })}
                    </form>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button negative>No</Button>
                <Button positive onClick={triggerSubmit}>
                    Submit
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default LibraryItemsModal;
