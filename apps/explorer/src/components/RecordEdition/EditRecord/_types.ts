// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormFieldTypes, FormUIElementTypes} from '@leav/types';
import {GET_FORM_forms_list_elements_elements} from '_gqlTypes/GET_FORM';
import {Override} from '_types/Override';

export interface IFormElementsByContainer {
    [containerId: string]: Array<FormElement<unknown>>;
}

export interface IFormElementProps<SettingsType> {
    element: FormElement<SettingsType>;
}

export type FormElement<SettingsType> = Override<
    GET_FORM_forms_list_elements_elements,
    {
        settings: SettingsType;
        uiElementType: FormUIElementTypes | FormFieldTypes;
    }
> & {
    uiElement: (props: IFormElementProps<unknown>) => JSX.Element;
};

export interface IDependencyValues {
    [attributeId: string]: Array<{id: string; library: string}>;
}
