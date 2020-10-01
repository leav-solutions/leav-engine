import {useMutation} from '@apollo/react-hooks';
import React, {useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Grid} from 'semantic-ui-react';
import {saveFormQuery} from '../../../../../../../../queries/forms/saveFormMutation';
import {GET_FORM_forms_list} from '../../../../../../../../_gqlTypes/GET_FORM';
import {
    FormElementInput,
    FormElementsByDepsInput,
    TreeElementInput
} from '../../../../../../../../_gqlTypes/globalTypes';
import {SAVE_FORM, SAVE_FORMVariables} from '../../../../../../../../_gqlTypes/SAVE_FORM';
import BreadcrumbNavigator from './BreadcrumbNavigator';
import DependencySettings from './DependencySettings';
import ElementsReserve from './ElementsReserve';
import {formBuilderReducer} from './formBuilderReducer';
import computateInitialState from './formBuilderReducer/computeInitialState';
import {defaultDepAttribute, defaultDepValue} from './formBuilderReducer/formBuilderReducer';
import FormLayout from './FormLayout';

interface IContentTabProps {
    library: string;
    form: GET_FORM_forms_list;
}

function ContentTab({library, form}: IContentTabProps): JSX.Element {
    const {t} = useTranslation();
    const [state, dispatch] = useReducer(formBuilderReducer, computateInitialState(library, form));
    const [saveForm] = useMutation<SAVE_FORM, SAVE_FORMVariables>(saveFormQuery);

    const _handleSubmit = () => {
        const savableElements = Object.keys(state.elements).reduce(
            (allElems: FormElementsByDepsInput[], depAttr: string): FormElementsByDepsInput[] => {
                const elemsWithDeps = Object.keys(state.elements[depAttr]).reduce(
                    (allDepElems: FormElementsByDepsInput[], depVal: string): FormElementsByDepsInput[] => {
                        const elems: FormElementInput[] = Object.values(state.elements[depAttr][depVal])
                            .flat()
                            .map(el => ({
                                id: el.id,
                                containerId: el.containerId,
                                order: el.order,
                                uiElementType: el.uiElement.type,
                                type: el.type,
                                settings: Object.entries(el.settings || {}).map(([key, value]) => ({
                                    key,
                                    value
                                }))
                            }));

                        const depElems: FormElementsByDepsInput = {elements: elems};

                        if (depAttr !== defaultDepAttribute && depVal !== defaultDepValue) {
                            const [depLibrary, depId] = depVal.split('/');

                            const depValue: TreeElementInput = {library: depLibrary, id: depId};

                            depElems.dependencyValue = {
                                attribute: depAttr,
                                value: depValue
                            };
                        }

                        return [...allDepElems, depElems];
                    },
                    []
                );

                return [...allElems, ...elemsWithDeps];
            },
            []
        );

        saveForm({
            variables: {
                formData: {
                    id: form.id,
                    library,
                    elements: savableElements
                }
            }
        });
    };

    return (
        <Grid columns={2} stackable verticalAlign="top">
            {state.activeDependency?.attribute && (
                <Grid.Row stretched>
                    <BreadcrumbNavigator state={state} dispatch={dispatch} />
                </Grid.Row>
            )}
            <Grid.Row stretched>
                <Grid.Column width={4} className="elements">
                    <DependencySettings state={state} dispatch={dispatch} />
                    <ElementsReserve state={state} dispatch={dispatch} />
                </Grid.Column>
                <Grid.Column className="layout" width={12}>
                    <FormLayout state={state} dispatch={dispatch} />
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Button onClick={_handleSubmit}>{t('admin.submit')}</Button>
            </Grid.Row>
        </Grid>
    );
}

export default ContentTab;
