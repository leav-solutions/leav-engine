import {act, renderHook} from '@testing-library/react';
import {useAutomationFormData} from './useAutomationFormData';
import {type RJSFSchema} from '@rjsf/utils';
import {type AutomationFormValues} from '../../types';
import {type IChangeEvent} from '@rjsf/core';
import {AutomationRuleEventAction} from '../../../../_gqlTypes';

const mockSchema: RJSFSchema = {
    type: 'object',
    properties: {
        label: {type: 'string'},
        description: {type: 'string'},
        trigger: {
            type: 'object',
            properties: {
                eventAction: {
                    type: 'string',
                    enum: [AutomationRuleEventAction.RECORD_INIT, AutomationRuleEventAction.RECORD_SAVE],
                },
            },
            allOf: [
                {
                    if: {
                        properties: {eventAction: {const: AutomationRuleEventAction.RECORD_INIT}},
                        required: ['eventAction'],
                    },
                    then: {
                        properties: {synchronous: {type: 'boolean', default: true, readOnly: true}},
                        required: ['synchronous'],
                    },
                },
                {
                    if: {
                        properties: {eventAction: {const: AutomationRuleEventAction.RECORD_SAVE}},
                        required: ['eventAction'],
                    },
                    then: {
                        properties: {synchronous: {type: 'boolean', default: false, readOnly: true}},
                        required: ['synchronous'],
                    },
                },
            ],
        },
    },
    required: ['label'],
};

const mockInitialValues: AutomationFormValues = {
    label: 'My automation',
    description: 'A description',
    active: true,
    trigger: {eventAction: AutomationRuleEventAction.RECORD_INIT, synchronous: true},
};

const mockOnSubmit = jest.fn();

describe('useAutomationFormData', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('hasUnsavedChanges', () => {
        test('returns false when formSchema is null', () => {
            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: mockInitialValues,
                    isCreationForm: false,
                    formSchema: null,
                    onSubmit: mockOnSubmit,
                }),
            );

            expect(result.current.hasUnsavedChanges).toBe(false);
        });

        test('returns false in creation when formData matches schema defaults', () => {
            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: null,
                    isCreationForm: true,
                    formSchema: mockSchema,
                    onSubmit: mockOnSubmit,
                }),
            );

            expect(result.current.hasUnsavedChanges).toBe(false);
        });

        test('returns false in edition when formData matches initialValues', () => {
            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: mockInitialValues,
                    isCreationForm: false,
                    formSchema: mockSchema,
                    onSubmit: mockOnSubmit,
                }),
            );

            expect(result.current.hasUnsavedChanges).toBe(false);
        });

        test('returns true in creation after a field is changed', () => {
            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: null,
                    isCreationForm: true,
                    formSchema: mockSchema,
                    onSubmit: mockOnSubmit,
                }),
            );

            act(() => {
                result.current.handleChange({
                    formData: {label: 'New automation', description: ''},
                } as IChangeEvent<AutomationFormValues>);
            });

            expect(result.current.hasUnsavedChanges).toBe(true);
        });

        test('returns true in edition after a field is changed', () => {
            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: mockInitialValues,
                    isCreationForm: false,
                    formSchema: mockSchema,
                    onSubmit: mockOnSubmit,
                }),
            );

            act(() => {
                result.current.handleChange({
                    formData: {...mockInitialValues, label: 'Changed label'},
                } as IChangeEvent<AutomationFormValues>);
            });

            expect(result.current.hasUnsavedChanges).toBe(true);
        });
    });

    describe('handleChange — eventAction reset', () => {
        test('resets eventTopic to {} and sets synchronous from schema default when eventAction changes', () => {
            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: mockInitialValues,
                    isCreationForm: false,
                    formSchema: mockSchema,
                    onSubmit: mockOnSubmit,
                }),
            );

            act(() => {
                result.current.handleChange({
                    formData: {
                        ...mockInitialValues,
                        trigger: {
                            eventAction: AutomationRuleEventAction.RECORD_SAVE,
                            synchronous: true,
                            eventTopic: {library: 'products'},
                        },
                    },
                } as IChangeEvent<AutomationFormValues>);
            });

            expect(result.current.formData?.trigger).toEqual({
                eventAction: AutomationRuleEventAction.RECORD_SAVE,
                eventTopic: {},
                synchronous: false, // RECORD_SAVE default from schema
            });
        });

        test('preserves eventTopic when eventAction does not change', () => {
            const initialWithTopic: AutomationFormValues = {
                ...mockInitialValues,
                trigger: {
                    eventAction: AutomationRuleEventAction.RECORD_INIT,
                    synchronous: true,
                    eventTopic: {library: 'products'},
                },
            };

            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: initialWithTopic,
                    isCreationForm: false,
                    formSchema: mockSchema,
                    onSubmit: mockOnSubmit,
                }),
            );

            act(() => {
                result.current.handleChange({
                    formData: {
                        ...initialWithTopic,
                        label: 'Updated label',
                    },
                } as IChangeEvent<AutomationFormValues>);
            });

            expect(result.current.formData?.trigger?.eventTopic).toEqual({library: 'products'});
        });
    });

    describe('handleFormSubmit', () => {
        test('calls onSubmit with submitted form data', () => {
            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: mockInitialValues,
                    isCreationForm: false,
                    formSchema: mockSchema,
                    onSubmit: mockOnSubmit,
                }),
            );

            act(() => {
                result.current.handleFormSubmit({formData: mockInitialValues} as IChangeEvent<AutomationFormValues>);
            });

            expect(mockOnSubmit).toHaveBeenCalledWith(mockInitialValues);
        });

        test('does not call onSubmit when formData is undefined', () => {
            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: mockInitialValues,
                    isCreationForm: false,
                    formSchema: mockSchema,
                    onSubmit: mockOnSubmit,
                }),
            );

            act(() => {
                result.current.handleFormSubmit({formData: undefined} as IChangeEvent<AutomationFormValues>);
            });

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });
    });
});
