// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import useMessages from 'hooks/useMessages';
import React, {useCallback, useEffect, useReducer, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {MessagesTypes} from 'reduxStore/messages/messages';
import {Button, Grid, Icon} from 'semantic-ui-react';
import {SAVE_FORM, SAVE_FORMVariables} from '../../../../../../../../_gqlTypes/SAVE_FORM';
import {FormElementInput, FormElementsByDepsInput} from '../../../../../../../../_gqlTypes/globalTypes';
import {saveFormQuery} from '../../../../../../../../queries/forms/saveFormMutation';
import {useEditFormModalButtonsContext} from '../../../EditFormModal/EditFormModalButtonsContext';
import {useEditFormContext} from '../../hooks/useEditFormContext';
import BreadcrumbNavigator from './BreadcrumbNavigator';
import DependencySettings from './DependencySettings';
import ElementsReserve from './ElementsReserve';
import FormLayout from './FormLayout';
import {formBuilderReducer} from './formBuilderReducer';
import computateInitialState from './formBuilderReducer/computeInitialState';
import {defaultDepAttribute, defaultDepValue} from './formBuilderReducer/formBuilderReducer';
import {FormBuilderReducerContext} from './formBuilderReducer/hook/useFormBuilderReducer';

function ContentTab(): JSX.Element {
    const {t} = useTranslation();
    const {addMessage} = useMessages();
    const {form, library, readonly} = useEditFormContext();
    const [state, dispatch] = useReducer(formBuilderReducer, computateInitialState(library, form));
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const {setButton, removeButton} = useEditFormModalButtonsContext();

    const [saveForm] = useMutation<SAVE_FORM, SAVE_FORMVariables>(saveFormQuery, {
        onCompleted: () => setIsSaving(false),
        onError: () => setIsSaving(false)
    });

    const _handleSubmit = useCallback(async () => {
        if (readonly) {
            return;
        }

        setIsSaving(true);
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
                                settings: Object.entries(el.settings || {}).reduce((allSettings, [key, value]) => {
                                    if (typeof value !== 'undefined') {
                                        allSettings.push({key, value});
                                    }

                                    return allSettings;
                                }, [])
                            }));

                        const depElems: FormElementsByDepsInput = {elements: elems};

                        if (depAttr !== defaultDepAttribute && depVal !== defaultDepValue) {
                            depElems.dependencyValue = {
                                attribute: depAttr,
                                value: depVal
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

        await saveForm({
            variables: {
                formData: {
                    id: form.id,
                    library,
                    elements: savableElements
                }
            }
        });

        addMessage({
            type: MessagesTypes.SUCCESS,
            content: t('forms.save_success')
        });
        setIsSaving(false);
    }, [state]);

    // This useEffect is used to transmit submit button to parent modal
    useEffect(() => {
        if (readonly) {
            return;
        }

        const buttonKey = 'saveContent';

        setButton(
            buttonKey,
            <Button loading={isSaving} key={buttonKey} primary icon labelPosition="left" onClick={_handleSubmit}>
                <Icon name="save" />
                {t('admin.save')}
            </Button>
        );

        return () => {
            removeButton(buttonKey);
        };
    }, [isSaving, _handleSubmit]);

    return (
        <FormBuilderReducerContext.Provider value={{state, dispatch}}>
            <Grid columns={2} stackable verticalAlign="top">
                {state.activeDependency?.attribute && (
                    <Grid.Row stretched>
                        <BreadcrumbNavigator />
                    </Grid.Row>
                )}
                <Grid.Row stretched>
                    <Grid.Column width={4} className="elements">
                        <DependencySettings />
                        <ElementsReserve />
                    </Grid.Column>
                    <Grid.Column className="layout" width={12}>
                        <FormLayout />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </FormBuilderReducerContext.Provider>
    );
}

export default ContentTab;
