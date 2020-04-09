import Joi from '@hapi/joi';
import Maybe from 'graphql/tsutils/Maybe';
import {FormFieldType, FormLayoutElementType, IFormLayoutElement} from '../../../../_types/forms';

export const validateFormLayout = (layout: Maybe<IFormLayoutElement[]>) => {
    let tab;
    let layoutElement;

    tab = Joi.object().keys({
        title: Joi.string().required(),
        content: Joi.array().items(Joi.link('#layoutElement'))
    });

    layoutElement = Joi.object({
        id: Joi.string().required(),
        type: Joi.string().allow(...Object.values(FormLayoutElementType)),
        title: Joi.string(),
        tabs: Joi.array().items(tab)
    }).id('layoutElement');

    const schema = Joi.array().items(layoutElement);

    const isValid = schema.validate(layout);

    if (!!isValid.error) {
        const errorMsg = isValid.error.details.map(e => e.message).join(', ');
        throw new TypeError(errorMsg);
    }
};

export const validateFormFields = (layout: Maybe<IFormLayoutElement[]>) => {
    const treeElement = Joi.object({id: Joi.number().required(), library: Joi.string().required()});
    const dependencyValue = Joi.object().pattern(Joi.string(), treeElement);
    const sysTranslation = Joi.object().pattern(Joi.string(), Joi.string());

    const fields = Joi.object({
        containerId: Joi.string().required(),
        type: Joi.string().allow(...Object.values(FormFieldType)),
        attribute: Joi.string(),
        required: Joi.boolean(),
        input: Joi.string(),
        label: sysTranslation,
        description: sysTranslation,
        content: Joi.string()
    });

    const formFields = Joi.object({
        dependency: Joi.array().items(dependencyValue),
        fields: Joi.array().items(fields)
    });

    const schema = Joi.array().items(formFields);

    const isValid = schema.validate(layout);

    if (!!isValid.error) {
        const errorMsg = isValid.error.details.map(e => e.message).join(', ');
        throw new TypeError(errorMsg);
    }
};
