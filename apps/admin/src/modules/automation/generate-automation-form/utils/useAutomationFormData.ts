// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMemo, useState} from 'react';
import {type IChangeEvent} from '@rjsf/core';
import {deepEquals, getDefaultFormState, type RJSFSchema} from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import {type AutomationFormValues} from '../../types';

type UseAutomationFormDataParams = {
    initialValues: AutomationFormValues | null;
    isCreationForm: boolean;
    formSchema: RJSFSchema | null;
    onSubmit: (values: AutomationFormValues) => Promise<void>;
};

const normalize = (data: unknown): unknown => {
    switch (typeof data) {
        case 'object':
            if (Array.isArray(data)) {
                return data.map(x => normalize(x));
            }
            if (data === null || Object.keys(data).length === 0) {
                return undefined;
            }
            return Object.fromEntries(
                Object.entries(data)
                    .map(([key, value]) => [key, normalize(value)])
                    .filter(([, value]) => value !== undefined),
            );
        default:
            return data;
    }
};

const _getSynchronousDefault = (formSchema: RJSFSchema, eventAction: string): boolean | undefined => {
    const triggerSchema = formSchema.properties?.trigger as RJSFSchema;
    const allOf = triggerSchema?.allOf as Array<{if?: RJSFSchema; then?: RJSFSchema}>;

    const matchingBranch = allOf?.find(
        branch => (branch.if?.properties?.eventAction as {const?: string} | undefined)?.const === eventAction,
    );

    return (matchingBranch?.then?.properties?.synchronous as {default?: boolean} | undefined)?.default;
};

/**
 * Manages RJSF form state, unsaved changes detection, and form submission.
 * Handles the eventAction → topic reset logic when the trigger type changes.
 */
export const useAutomationFormData = ({
    initialValues,
    isCreationForm,
    formSchema,
    onSubmit,
}: UseAutomationFormDataParams) => {
    const [formData, setFormData] = useState<AutomationFormValues>(initialValues);

    const hasUnsavedChanges = useMemo(() => {
        if (!formSchema) {
            return false;
        }
        const baseline = isCreationForm ? getDefaultFormState(validator, formSchema, null) : initialValues;
        return !deepEquals(normalize(formData), normalize(baseline));
    }, [formData, initialValues, isCreationForm, formSchema]);

    const handleChange = ({formData: newFormData}: IChangeEvent<AutomationFormValues>) => {
        let data = newFormData;

        // When eventAction changes, reset topic to {} so AJV validates topic's required children
        // (e.g. library) rather than carrying over stale values from the previous trigger type.
        const prevEventAction = formData?.trigger?.eventAction;
        const nextEventAction = data?.trigger?.eventAction;
        if (nextEventAction && nextEventAction !== prevEventAction && formSchema) {
            data = {
                ...data,
                trigger: {
                    eventAction: nextEventAction,
                    eventTopic: {},
                    synchronous: _getSynchronousDefault(formSchema, nextEventAction),
                },
            };
        }

        setFormData(data);
    };

    const handleFormSubmit = ({formData: submittedData}: IChangeEvent<AutomationFormValues>) => {
        if (!submittedData) {
            return;
        }

        onSubmit(submittedData);
    };

    return {formData, hasUnsavedChanges, handleChange, handleFormSubmit};
};
