import {FormFieldTypes, FormUIElementTypes} from '@leav/utils';
import {type IFormElementProps} from '../_types';
import Container from './Container';
import FormDivider from './FormDivider';
import FormTabs from './FormTabs';
import LinkField from './LinkField';
import StandardField from './StandardField';
import TextBlock from './TextBlock';
import TreeField from './TreeField';
import Frame from './Frame';

export const formComponents: {
    [type in FormUIElementTypes & FormFieldTypes]: (props: IFormElementProps<any>) => JSX.Element;
} = {
    [FormUIElementTypes.FIELDS_CONTAINER]: Container,
    [FormFieldTypes.TEXT_INPUT]: StandardField,
    [FormFieldTypes.DATE]: StandardField,
    [FormFieldTypes.CHECKBOX]: StandardField,
    [FormFieldTypes.ENCRYPTED]: StandardField,
    [FormFieldTypes.LINK]: LinkField,
    [FormFieldTypes.TREE]: TreeField,
    [FormUIElementTypes.TABS]: FormTabs,
    [FormUIElementTypes.TEXT_BLOCK]: TextBlock,
    [FormUIElementTypes.DIVIDER]: FormDivider,
    [FormUIElementTypes.FRAME]: Frame,
};
