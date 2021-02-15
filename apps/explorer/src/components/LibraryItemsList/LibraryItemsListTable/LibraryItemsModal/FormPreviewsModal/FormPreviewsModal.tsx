// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Form, Input} from 'antd';
import React from 'react';
import {getFileUrl, getPreviewSizes} from '../../../../../utils';
import {IItem, IPreview, PreviewAttributes} from '../../../../../_types/types';

interface IFormPreviewsModal {
    values: IItem;
    updateValues: (item: IItem) => void;
}

const FormPreviewsModal = ({values, updateValues}: IFormPreviewsModal) => {
    const previewAttributes = getPreviewSizes();

    const defaultPreview: any = {};

    for (const att of previewAttributes) {
        defaultPreview[att] = '';
    }

    return (
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div>
                {values.whoAmI.preview?.big ? (
                    <img src={getFileUrl(values.whoAmI.preview.big)} alt="preview" style={{width: '20rem'}} />
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

    const preview = values.whoAmI.preview;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPreview = preview
            ? {...preview, [previewAttribute]: e.target.value}
            : {
                  ...(defaultPreview as IPreview),
                  [previewAttribute]: e.target.value
              };

        updateValues({
            ...values,
            whoAmI: {
                ...values.whoAmI,
                preview: newPreview
            }
        });
    };

    return (
        <Form.Item label={previewAttribute}>
            <Input disabled value={(preview && preview[att]) ?? ''} onChange={onChange} />
        </Form.Item>
    );
};

export default FormPreviewsModal;
