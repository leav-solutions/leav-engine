// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormFieldTypes, FormUIElementTypes} from '@leav/types';
import {IFormElementProps} from '../_types';
import Container from './Container';
import FormDivider from './FormDivider';
import FormTabs from './FormTabs';
import LinkField from './LinkField';
import StandardField from './StandardField';
import TextBlock from './TextBlock';
import TreeField from './TreeField';

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
    [FormUIElementTypes.DIVIDER]: FormDivider
};
