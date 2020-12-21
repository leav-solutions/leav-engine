// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Form, Input} from 'antd';
import React from 'react';
import {getPreviewSizes, getPreviewUrl} from '../../../../../utils';
import {IItem, IPreview, PreviewAttributes} from '../../../../../_types/types';

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
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div>
                {values.preview?.big ? (
                    <img src={getPreviewUrl(values.preview.big)} alt="preview" style={{width: '20rem'}} />
                ) : (
                    <div>No Preview</div>
                )}
            </div>
            <div style={{width: '20rem'}}>
                {previewAttributes.map(previewAttribute => (
                    <FormPreviewModal
                        key={previewAttribute}
                        values={values}
                        updateValues={updateValues}
                        previewAttribute={previewAttribute}
                        defaultPreview={defaultPreview}
                    />
                ))}
            </div>
        </div>
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

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateValues({
            ...values,
            preview: values.preview
                ? ({...values.preview, [previewAttribute]: e.target.value} as IPreview)
                : ({
                      ...(defaultPreview as IPreview),
                      [previewAttribute]: e.target.value
                  } as IPreview)
        });
    };

    return (
        <Form.Item label={previewAttribute}>
            <Input disabled value={(values.preview && values.preview[att]) ?? ''} onChange={onChange} />
        </Form.Item>
    );
};

export default FormPreviewsModal;
