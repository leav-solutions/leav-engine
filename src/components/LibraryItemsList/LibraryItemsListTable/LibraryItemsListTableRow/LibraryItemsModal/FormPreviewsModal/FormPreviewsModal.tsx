import React from 'react';
import {Form, Grid, Image} from 'semantic-ui-react';
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
        <Grid columns="2">
            <Grid.Column>
                {values.preview?.big ? (
                    <Image size="large" src={getPreviewUrl(values.preview.big)} />
                ) : (
                    <div>No Preview</div>
                )}
            </Grid.Column>
            <Grid.Column>
                {previewAttributes.map(previewAttribute => (
                    <FormPreviewModal
                        key={previewAttribute}
                        values={values}
                        updateValues={updateValues}
                        previewAttribute={previewAttribute}
                        defaultPreview={defaultPreview}
                    />
                ))}
            </Grid.Column>
        </Grid>
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
        <Form.Field>
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
        </Form.Field>
    );
};

export default FormPreviewsModal;
