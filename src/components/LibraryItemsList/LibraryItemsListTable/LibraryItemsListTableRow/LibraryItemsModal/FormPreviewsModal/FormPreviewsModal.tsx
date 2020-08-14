import {Col, Form, Row} from 'antd';
import React from 'react';
import {getPreviewSizes, getPreviewUrl} from '../../../../../../utils';
import {IItem, IPreview, PreviewAttributes} from '../../../../../../_types/types';

interface IFormPreviewsModal {
    values: IItem;
    updateValues: (item: IItem) => void;
}

const FormPreviewsModal = ({values, updateValues}: IFormPreviewsModal) => {
    const previewAttributes = getPreviewSizes();

    const defaultPreview: any = {};

    for (let att of previewAttributes) {
        defaultPreview[att] = '';
    }

    return (
        <Row>
            <Col>
                {values.preview?.big ? (
                    <img src={getPreviewUrl(values.preview.big)} alt="preview" />
                ) : (
                    <div>No Preview</div>
                )}
            </Col>
            <Col>
                {previewAttributes.map(previewAttribute => (
                    <FormPreviewModal
                        key={previewAttribute}
                        values={values}
                        updateValues={updateValues}
                        previewAttribute={previewAttribute}
                        defaultPreview={defaultPreview}
                    />
                ))}
            </Col>
        </Row>
    );
};

interface IFormPreviewModal {
    values: IItem;
    updateValues: (item: IItem) => void;
    previewAttribute: PreviewAttributes;
    defaultPreview: any;
}

const FormPreviewModal = ({values, updateValues, previewAttribute, defaultPreview}: IFormPreviewModal) => {
    const att: 'small' | 'medium' | 'big' | 'pages' = previewAttribute as any;

    return (
        <Form.Item>
            <label>{previewAttribute}</label>
            <input
                disabled
                value={(values.preview && values.preview[att]) ?? ''}
                onChange={e =>
                    updateValues({
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
        </Form.Item>
    );
};

export default FormPreviewsModal;
