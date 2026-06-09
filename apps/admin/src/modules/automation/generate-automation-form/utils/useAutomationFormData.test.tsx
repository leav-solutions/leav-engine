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

const mockOnSubmit = vi.fn<(values: AutomationFormValues) => Promise<boolean>>().mockResolvedValue(true);

describe('useAutomationFormData', () => {
    beforeEach(() => vi.clearAllMocks());

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
        test('calls onSubmit with submitted form data', async () => {
            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: mockInitialValues,
                    isCreationForm: false,
                    formSchema: mockSchema,
                    onSubmit: mockOnSubmit,
                }),
            );

            await act(async () => {
                await result.current.handleFormSubmit({
                    formData: mockInitialValues,
                } as IChangeEvent<AutomationFormValues>);
            });

            expect(mockOnSubmit).toHaveBeenCalledWith(mockInitialValues);
        });

        test('does not call onSubmit when formData is undefined', async () => {
            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: mockInitialValues,
                    isCreationForm: false,
                    formSchema: mockSchema,
                    onSubmit: mockOnSubmit,
                }),
            );

            await act(async () => {
                await result.current.handleFormSubmit({formData: undefined} as IChangeEvent<AutomationFormValues>);
            });

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });
    });

    describe('baseline reset after submit', () => {
        test('hasUnsavedChanges becomes false after a successful submit in edition mode', async () => {
            const successfulOnSubmit = vi
                .fn<(values: AutomationFormValues) => Promise<boolean>>()
                .mockResolvedValue(true);

            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: mockInitialValues,
                    isCreationForm: false,
                    formSchema: mockSchema,
                    onSubmit: successfulOnSubmit,
                }),
            );

            const updated = {...mockInitialValues, label: 'Updated label'};
            act(() => {
                result.current.handleChange({formData: updated} as IChangeEvent<AutomationFormValues>);
            });
            expect(result.current.hasUnsavedChanges).toBe(true);

            await act(async () => {
                await result.current.handleFormSubmit({formData: updated} as IChangeEvent<AutomationFormValues>);
            });

            expect(result.current.hasUnsavedChanges).toBe(false);
        });

        test('hasUnsavedChanges stays true after a failed submit (onSubmit resolves to false)', async () => {
            const failingOnSubmit = vi
                .fn<(values: AutomationFormValues) => Promise<boolean>>()
                .mockResolvedValue(false);

            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: mockInitialValues,
                    isCreationForm: false,
                    formSchema: mockSchema,
                    onSubmit: failingOnSubmit,
                }),
            );

            const updated = {...mockInitialValues, label: 'Updated label'};
            act(() => {
                result.current.handleChange({formData: updated} as IChangeEvent<AutomationFormValues>);
            });

            await act(async () => {
                await result.current.handleFormSubmit({formData: updated} as IChangeEvent<AutomationFormValues>);
            });

            expect(result.current.hasUnsavedChanges).toBe(true);
        });

        test('hasUnsavedChanges becomes true again when the form is edited after a successful submit', async () => {
            const successfulOnSubmit = vi
                .fn<(values: AutomationFormValues) => Promise<boolean>>()
                .mockResolvedValue(true);

            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: mockInitialValues,
                    isCreationForm: false,
                    formSchema: mockSchema,
                    onSubmit: successfulOnSubmit,
                }),
            );

            const firstSubmitData = {...mockInitialValues, label: 'First edit'};
            act(() => {
                result.current.handleChange({formData: firstSubmitData} as IChangeEvent<AutomationFormValues>);
            });
            await act(async () => {
                await result.current.handleFormSubmit({
                    formData: firstSubmitData,
                } as IChangeEvent<AutomationFormValues>);
            });
            expect(result.current.hasUnsavedChanges).toBe(false);

            act(() => {
                result.current.handleChange({
                    formData: {...firstSubmitData, label: 'Second edit'},
                } as IChangeEvent<AutomationFormValues>);
            });

            expect(result.current.hasUnsavedChanges).toBe(true);
        });
    });

    describe('isSubmitting', () => {
        test('is false by default', () => {
            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: mockInitialValues,
                    isCreationForm: false,
                    formSchema: mockSchema,
                    onSubmit: mockOnSubmit,
                }),
            );

            expect(result.current.isSubmitting).toBe(false);
        });

        test('is true while onSubmit is pending and back to false after success', async () => {
            let resolveOnSubmit: (value: boolean) => void = vi.fn();
            const pendingOnSubmit = vi.fn(
                () =>
                    new Promise<boolean>(resolve => {
                        resolveOnSubmit = resolve;
                    }),
            );

            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: mockInitialValues,
                    isCreationForm: false,
                    formSchema: mockSchema,
                    onSubmit: pendingOnSubmit,
                }),
            );

            let submitPromise: Promise<void> = Promise.resolve();
            act(() => {
                submitPromise = result.current.handleFormSubmit({
                    formData: mockInitialValues,
                } as IChangeEvent<AutomationFormValues>);
            });

            expect(result.current.isSubmitting).toBe(true);

            await act(async () => {
                resolveOnSubmit(true);
                await submitPromise;
            });

            expect(result.current.isSubmitting).toBe(false);
        });

        test('is reset to false when onSubmit rejects', async () => {
            const rejectingOnSubmit = vi.fn(() => Promise.reject(new Error('boom')));

            const {result} = renderHook(() =>
                useAutomationFormData({
                    initialValues: mockInitialValues,
                    isCreationForm: false,
                    formSchema: mockSchema,
                    onSubmit: rejectingOnSubmit,
                }),
            );

            await act(async () => {
                await expect(
                    result.current.handleFormSubmit({
                        formData: mockInitialValues,
                    } as IChangeEvent<AutomationFormValues>),
                ).rejects.toThrow('boom');
            });

            expect(result.current.isSubmitting).toBe(false);
        });
    });
});
