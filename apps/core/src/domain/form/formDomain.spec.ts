// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormUIElementTypes, FORM_ROOT_CONTAINER_ID} from '@leav/utils';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IValidateHelper} from 'domain/helpers/validate';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {ILibraryPermissionDomain} from 'domain/permission/libraryPermissionDomain';
import {IRecordAttributePermissionDomain} from 'domain/permission/recordAttributePermissionDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IFormRepo} from 'infra/form/formRepo';
import {IUtils, ToAny} from 'utils/utils';
import {Winston} from 'winston';
import {IForm} from '_types/forms';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {mockAttrSimple} from '../../__tests__/mocks/attribute';
import {formField, formLayoutElement, mockForm} from '../../__tests__/mocks/forms';
import {mockLibrary} from '../../__tests__/mocks/library';
import {mockStandardValue} from '../../__tests__/mocks/value';
import formDomain, {IFormDomainDeps} from './formDomain';

const depsBase: ToAny<IFormDomainDeps> = {
    'core.domain.library': jest.fn(),
    'core.domain.attribute': jest.fn(),
    'core.domain.record': jest.fn(),
    'core.domain.permission.library': jest.fn(),
    'core.domain.permission.recordAttribute': jest.fn(),
    'core.domain.permission.attribute': jest.fn(),
    'core.domain.helpers.validate': jest.fn(),
    'core.domain.tree': jest.fn(),
    'core.infra.form': jest.fn(),
    'core.utils': jest.fn(),
    'core.utils.logger': jest.fn(),
    translator: {}
};

describe('formDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'formDomainTest'
    };

    const mockLibDomain: Mockify<ILibraryDomain> = {
        getLibraries: global.__mockPromise({list: [mockLibrary]})
    };

    const mockLibDomainNoLib: Mockify<ILibraryDomain> = {
        getLibraries: global.__mockPromise({list: []})
    };

    const mockAttrDomain: Mockify<IAttributeDomain> = {
        getAttributes: global.__mockPromise({list: [{...mockAttrSimple, id: 'test_attribute'}]})
    };

    const mockLibraryPermDomain: Mockify<ILibraryPermissionDomain> = {
        getLibraryPermission: global.__mockPromise(true)
    };

    const mockRecordDomain: Mockify<IRecordDomain> = {
        getRecordFieldValue: global.__mockPromise(mockStandardValue)
    };

    const mockValidateHelper: Mockify<IValidateHelper> = {
        validateLibrary: jest.fn()
    };

    const mockValidateHelperNoLibrary: Mockify<IValidateHelper> = {
        ...mockValidateHelper,
        validateLibrary: jest.fn(() => {
            throw new ValidationError({id: 'boom'});
        })
    };

    const mockUtils: Mockify<IUtils> = {
        isIdValid: jest.fn().mockReturnValue(true),
        translateError: jest.fn().mockReturnValue('boom!')
    };

    describe('Get forms by lib', () => {
        test('Get form by lib', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: [mockForm]})
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.domain.permission.library': mockLibraryPermDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
            });

            const res = await domain.getFormsByLib({library: 'my_lib', ctx});

            expect(mockFormRepo.getForms).toBeCalled();
            expect(res).toEqual({list: [mockForm]});
        });

        test('If unknown library, throw validation error', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: []})
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.library': mockLibDomainNoLib as ILibraryDomain,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.domain.permission.library': mockLibraryPermDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelperNoLibrary as IValidateHelper
            });

            await expect(domain.getFormsByLib({library: 'my_lib', ctx})).rejects.toThrow(ValidationError);
        });
    });

    describe('Get form properties', () => {
        test('Get form properties', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: [mockForm]})
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.domain.permission.library': mockLibraryPermDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
            });

            const res = await domain.getFormProperties({library: 'my_lib', id: 'edition_form', ctx});

            expect(mockFormRepo.getForms).toBeCalled();
            expect(res).toEqual(mockForm);
        });

        test('If unknown library, throw validation error', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: []})
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.library': mockLibDomainNoLib as ILibraryDomain,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.domain.permission.library': mockLibraryPermDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelperNoLibrary as IValidateHelper
            });

            await expect(domain.getFormProperties({library: 'my_lib', id: 'edition_form', ctx})).rejects.toThrow(
                ValidationError
            );
        });

        test('If unknown form, throw validation error', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: []})
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.domain.permission.library': mockLibraryPermDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
            });

            await expect(domain.getFormProperties({library: 'my_lib', id: 'edition_form', ctx})).rejects.toThrow(
                ValidationError
            );
        });
    });

    describe('Save form', () => {
        test('Save new form', async () => {
            const mockFormRepo = {
                getForms: global.__mockPromise({list: []}),
                updateForm: jest.fn(),
                createForm: global.__mockPromise(mockForm)
            } satisfies Mockify<IFormRepo>;

            const domain = formDomain({
                ...depsBase,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission.library': mockLibraryPermDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.infra.form': mockFormRepo as any,
                'core.utils': mockUtils as IUtils
            });

            const createdForm = await domain.saveForm({form: {...mockForm}, ctx});

            expect(mockFormRepo.createForm).toBeCalled();
            expect(mockFormRepo.createForm.mock.calls[0][0].formData.system).toBe(false);
            expect(mockFormRepo.updateForm).not.toBeCalled();
            expect(createdForm).toEqual(mockForm);
        });

        test('Save existing form', async () => {
            const mockFormRepo = {
                getForms: global.__mockPromise({list: [mockForm]}),
                updateForm: global.__mockPromise(mockForm),
                createForm: jest.fn()
            } satisfies Mockify<IFormRepo>;

            const domain = formDomain({
                ...depsBase,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission.library': mockLibraryPermDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.infra.form': mockFormRepo as any,
                'core.utils': mockUtils as IUtils
            });

            const newLabel = {fr: 'New label'};
            await domain.saveForm({
                form: {id: mockForm.id, library: mockForm.library, label: newLabel, sidePanel: mockForm.sidePanel},
                ctx
            });

            expect(mockFormRepo.updateForm).toBeCalled();
            expect(mockFormRepo.updateForm.mock.calls[0][0].formData).toEqual({
                ...mockForm,
                label: newLabel,
                system: false
            });
            expect(mockFormRepo.createForm).not.toBeCalled();
        });

        test('If unknown library, throw validation error', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: []}),
                updateForm: jest.fn(),
                createForm: jest.fn()
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.library': mockLibDomainNoLib as ILibraryDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission.library': mockLibraryPermDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelperNoLibrary as IValidateHelper,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(domain.saveForm({form: {...mockForm}, ctx})).rejects.toThrow(ValidationError);
            expect(mockFormRepo.createForm).not.toBeCalled();
            expect(mockFormRepo.updateForm).not.toBeCalled();
        });

        test('If invalid ID format, throw validation error', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: []}),
                updateForm: jest.fn(),
                createForm: jest.fn()
            };

            const mockUtilsInvalidID: Mockify<IUtils> = {
                isIdValid: jest.fn().mockReturnValue(false)
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission.library': mockLibraryPermDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.utils': mockUtilsInvalidID as IUtils
            });

            await expect(domain.saveForm({form: {...mockForm, id: 'invalid id'}, ctx})).rejects.toThrow(
                ValidationError
            );
            expect(mockFormRepo.createForm).not.toBeCalled();
            expect(mockFormRepo.updateForm).not.toBeCalled();
        });

        test('If field attribute does not exist, throw validation error', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: []}),
                updateForm: jest.fn(),
                createForm: jest.fn()
            };

            const mockAttrDomainNoMatch: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({list: []})
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.attribute': mockAttrDomainNoMatch as IAttributeDomain,
                'core.domain.permission.library': mockLibraryPermDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(domain.saveForm({form: {...mockForm, id: 'invalid id'}, ctx})).rejects.toThrow(
                ValidationError
            );
            expect(mockFormRepo.createForm).not.toBeCalled();
            expect(mockFormRepo.updateForm).not.toBeCalled();
        });

        test('If creation not allowed, throw permission error', async () => {
            const mockLibraryPermForbiddenDomain: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(false)
            };

            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: []}),
                updateForm: jest.fn(),
                createForm: global.__mockPromise(mockForm)
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission.library': mockLibraryPermForbiddenDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(domain.saveForm({form: {...mockForm}, ctx})).rejects.toThrow(PermissionError);

            expect(mockFormRepo.createForm).not.toBeCalled();
            expect(mockFormRepo.updateForm).not.toBeCalled();
        });

        test('If edition not allowed, throw permission error', async () => {
            const mockLibraryPermForbiddenDomain: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(false)
            };

            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: [mockForm]}),
                updateForm: global.__mockPromise(mockForm),
                createForm: jest.fn()
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission.library': mockLibraryPermForbiddenDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(domain.saveForm({form: {...mockForm}, ctx})).rejects.toThrow(PermissionError);

            expect(mockFormRepo.createForm).not.toBeCalled();
            expect(mockFormRepo.updateForm).not.toBeCalled();
        });
    });

    describe('Delete form', () => {
        test('Delete form', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: [mockForm]}),
                deleteForm: global.__mockPromise(mockForm)
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.permission.library': mockLibraryPermDomain as ILibraryPermissionDomain,
                'core.infra.form': mockFormRepo as IFormRepo
            });

            const res = await domain.deleteForm({library: 'my_lib', id: 'edition_form', ctx});

            expect(mockFormRepo.deleteForm).toBeCalled();
            expect(res).toEqual(mockForm);
        });

        test('If unknown form, throw validation error', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: []}),
                deleteForm: jest.fn()
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.permission.library': mockLibraryPermDomain as ILibraryPermissionDomain,
                'core.infra.form': mockFormRepo as IFormRepo
            });

            await expect(domain.deleteForm({library: 'my_lib', id: 'edition_form', ctx})).rejects.toThrow(
                ValidationError
            );
            expect(mockFormRepo.deleteForm).not.toBeCalled();
        });

        test('If not allowed, throw permission error', async () => {
            const mockLibraryPermForbiddenDomain: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(false)
            };

            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: [mockForm]}),
                deleteForm: global.__mockPromise(mockForm)
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.permission.library': mockLibraryPermForbiddenDomain as ILibraryPermissionDomain,
                'core.infra.form': mockFormRepo as IFormRepo
            });

            await expect(domain.deleteForm({library: 'my_lib', id: 'edition_form', ctx})).rejects.toThrow(
                PermissionError
            );
            expect(mockFormRepo.deleteForm).not.toBeCalled();
        });
    });
    describe('getRecordForm', () => {
        const mockRecordAttributePermissionDomain: Mockify<IRecordAttributePermissionDomain> = {
            getRecordAttributePermission: global.__mockPromise(true)
        };

        test('Return a record form with values', async () => {
            const domain = formDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.permission.recordAttribute':
                    mockRecordAttributePermissionDomain as IRecordAttributePermissionDomain
            });

            const mockDivider = {...formLayoutElement, id: 'divider', uiElementType: FormUIElementTypes.DIVIDER};
            const mockContainer = {...formLayoutElement};
            const field1 = {...formField, id: 'field1'};
            const field2 = {...formField, id: 'field2'};

            domain.getFormProperties = global.__mockPromise({
                ...mockForm,
                elements: [{elements: [field1, field2, mockContainer, mockDivider]}]
            });

            const res = await domain.getRecordForm({
                libraryId: 'my_lib',
                recordId: '123456',
                formId: 'edition',
                ctx
            });

            expect(res).toEqual({
                id: 'edition',
                library: 'my_lib',
                recordId: '123456',
                system: false,
                dependencyAttributes: [],
                sidePanel: mockForm.sidePanel,
                elements: [
                    {...mockContainer, valueError: null, values: null},
                    {...field1, valueError: null, values: [mockStandardValue]},
                    {...field2, valueError: null, values: [mockStandardValue]},
                    {...mockDivider, valueError: null, values: null}
                ]
            });
        });

        test('Return error encountered when fetching values', async () => {
            const mockRecordDomainThrowing: Mockify<IRecordDomain> = {
                getRecordFieldValue: jest.fn().mockRejectedValue(new Error('boom!'))
            };

            const mockLogger: Mockify<Winston> = {
                error: jest.fn()
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomainThrowing as IRecordDomain,
                'core.domain.permission.recordAttribute':
                    mockRecordAttributePermissionDomain as IRecordAttributePermissionDomain,
                'core.utils.logger': mockLogger as Winston
            });

            const mockContainer = {...formLayoutElement};
            const field1 = {...formField, id: 'field1'};

            domain.getFormProperties = global.__mockPromise({
                ...mockForm,
                elements: [{elements: [field1, mockContainer]}]
            });

            const res = await domain.getRecordForm({
                libraryId: 'my_lib',
                recordId: '123456',
                formId: 'edition',
                ctx
            });

            expect(res).toEqual({
                id: 'edition',
                library: 'my_lib',
                recordId: '123456',
                system: false,
                dependencyAttributes: [],
                sidePanel: mockForm.sidePanel,
                elements: [
                    {...mockContainer, valueError: null, values: null},
                    {...field1, values: null, valueError: 'boom!'}
                ]
            });
        });

        test('Return ValidationError encountered when fetching values', async () => {
            const mockRecordDomainThrowing: Mockify<IRecordDomain> = {
                getRecordFieldValue: jest.fn().mockRejectedValue(
                    new ValidationError({
                        test_attribute: 'boom!'
                    })
                )
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomainThrowing as IRecordDomain,
                'core.domain.permission.recordAttribute':
                    mockRecordAttributePermissionDomain as IRecordAttributePermissionDomain,
                'core.utils': mockUtils as IUtils
            });
            const mockContainer = {...formLayoutElement};
            const field1 = {...formField, id: 'field1'};

            domain.getFormProperties = global.__mockPromise({
                ...mockForm,
                elements: [{elements: [field1, mockContainer]}]
            });

            const res = await domain.getRecordForm({
                libraryId: 'my_lib',
                recordId: '123456',
                formId: 'edition',
                ctx
            });

            expect(res).toEqual({
                id: 'edition',
                library: 'my_lib',
                recordId: '123456',
                system: false,
                dependencyAttributes: [],
                sidePanel: mockForm.sidePanel,
                elements: [
                    {...mockContainer, valueError: null, values: null},
                    {...field1, values: null, valueError: 'boom!'}
                ]
            });
        });

        test('Retrieve fields by dependency value', async () => {
            const mockRecordDomainHandleDeps: Mockify<IRecordDomain> = {
                getRecordFieldValue: jest.fn().mockImplementation(async ({attributeId}) => {
                    switch (attributeId) {
                        case 'dep_attribute':
                            return {payload: {id: '987654', record: {id: '123456', library: 'dep_lib'}}};
                        default:
                            return mockStandardValue;
                    }
                })
            };

            const mockTreeDomain: Mockify<ITreeDomain> = {
                getElementAncestors: global.__mockPromise([{id: '987654', record: {id: '123456', library: 'dep_lib'}}])
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomainHandleDeps as IRecordDomain,
                'core.domain.tree': mockTreeDomain as ITreeDomain,
                'core.domain.permission.recordAttribute':
                    mockRecordAttributePermissionDomain as IRecordAttributePermissionDomain
            });

            const mockDepField1 = {
                ...formField,
                id: 'field1',
                containerId: FORM_ROOT_CONTAINER_ID,
                settings: {...formField.settings, label: 'Dep field 1'}
            };
            const mockDepField2 = {
                ...formField,
                id: 'field2',
                containerId: FORM_ROOT_CONTAINER_ID,
                settings: {...formField.settings, label: 'Dep field 2'}
            };
            const mockFormWithDeps: IForm = {
                ...mockForm,
                elements: [
                    {
                        elements: [{...formField, containerId: FORM_ROOT_CONTAINER_ID}]
                    },
                    {
                        dependencyValue: {attribute: 'dep_attribute', value: '987654'},
                        elements: [mockDepField1]
                    },
                    {
                        dependencyValue: {attribute: 'dep_attribute', value: '987655'},
                        elements: [mockDepField2]
                    }
                ]
            };

            domain.getFormProperties = global.__mockPromise(mockFormWithDeps);

            const res = await domain.getRecordForm({
                libraryId: 'my_lib',
                recordId: '123456',
                formId: 'edition',
                ctx
            });

            expect(res).toEqual({
                id: 'edition',
                library: 'my_lib',
                recordId: '123456',
                system: false,
                dependencyAttributes: [],
                sidePanel: mockForm.sidePanel,
                elements: [
                    {...formField, containerId: FORM_ROOT_CONTAINER_ID, valueError: null, values: [mockStandardValue]},
                    {...mockDepField1, valueError: null, values: [mockStandardValue]}
                ]
            });
        });

        test('Retrieve fields by dependency value, applying inheritance', async () => {
            const mockRecordDomainHandleDeps: Mockify<IRecordDomain> = {
                getRecordFieldValue: jest.fn().mockImplementation(async ({attributeId}) => {
                    switch (attributeId) {
                        case 'dep_attribute':
                            return {payload: {id: '987654', record: {id: '123456', library: 'dep_lib'}}};
                        default:
                            return mockStandardValue;
                    }
                })
            };

            const mockTreeDomain: Mockify<ITreeDomain> = {
                getElementAncestors: global.__mockPromise([
                    {id: '111111', record: {id: '123456', library: 'dep_lib'}},
                    {id: '987654', record: {id: '123457', library: 'dep_lib'}}
                ])
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomainHandleDeps as IRecordDomain,
                'core.domain.tree': mockTreeDomain as ITreeDomain,
                'core.domain.permission.recordAttribute':
                    mockRecordAttributePermissionDomain as IRecordAttributePermissionDomain
            });

            const mockDepField1 = {
                ...formField,
                id: 'field1',
                containerId: FORM_ROOT_CONTAINER_ID,
                settings: {...formField.settings, label: 'Dep field 1'}
            };
            const mockDepField2 = {
                ...formField,
                id: 'field2',
                containerId: FORM_ROOT_CONTAINER_ID,
                settings: {...formField.settings, label: 'Dep field 2'}
            };
            const mockFormWithDeps: IForm = {
                ...mockForm,
                elements: [
                    {
                        elements: [{...formField, containerId: FORM_ROOT_CONTAINER_ID}]
                    },
                    {
                        dependencyValue: {attribute: 'dep_attribute', value: '987654'},
                        elements: [mockDepField1]
                    },
                    {
                        dependencyValue: {attribute: 'dep_attribute', value: '111111'},
                        elements: [mockDepField2]
                    }
                ]
            };

            domain.getFormProperties = global.__mockPromise(mockFormWithDeps);

            const res = await domain.getRecordForm({
                libraryId: 'my_lib',
                recordId: '123456',
                formId: 'edition',
                ctx
            });

            expect(res).toEqual({
                id: 'edition',
                library: 'my_lib',
                recordId: '123456',
                system: false,
                dependencyAttributes: [],
                sidePanel: mockForm.sidePanel,
                elements: [
                    {...formField, containerId: FORM_ROOT_CONTAINER_ID, valueError: null, values: [mockStandardValue]},
                    {...mockDepField1, valueError: null, values: [mockStandardValue]},
                    {...mockDepField2, valueError: null, values: [mockStandardValue]}
                ]
            });
        });

        test('Remove fields not visible and their container if empty', async () => {
            const mockRecordDomainHandleDeps: Mockify<IRecordDomain> = {
                getRecordFieldValue: jest.fn().mockImplementation(async ({attributeId}) => {
                    switch (attributeId) {
                        case 'dep_attribute':
                            return {payload: {record: {id: '123456', library: 'dep_lib'}}};
                        default:
                            return mockStandardValue;
                    }
                })
            };

            const mockRecordAttributePermissionDomainForbidden: Mockify<IRecordAttributePermissionDomain> = {
                getRecordAttributePermission: jest.fn(async (action, userId, attributeId) => {
                    switch (attributeId) {
                        case 'allowed_attribute':
                            return true;
                        default:
                            return false;
                    }
                })
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomainHandleDeps as IRecordDomain,
                'core.domain.permission.recordAttribute':
                    mockRecordAttributePermissionDomainForbidden as IRecordAttributePermissionDomain
            });

            const filledContainer = {...formLayoutElement, id: 'container'};
            const emptyContainerParent = {...formLayoutElement, id: 'empty_container_parent'};
            const emptyContainerChild = {
                ...formLayoutElement,
                id: 'empty_container_child',
                containerId: 'empty_container_parent'
            };
            const mockField1 = {
                ...formField,
                id: 'field1',
                containerId: 'container',
                settings: {attribute: 'allowed_attribute'}
            };
            const mockField2 = {
                ...formField,
                id: 'field2',
                containerId: 'empty_container_child',
                settings: {attribute: 'forbidden_attribute'}
            };
            const mockDivider = {
                ...formLayoutElement,
                id: 'divider',
                uiElementType: FormUIElementTypes.DIVIDER,
                containerId: emptyContainerParent.id
            };

            const mockFormForPermissions: IForm = {
                ...mockForm,
                elements: [
                    {
                        elements: [
                            filledContainer,
                            emptyContainerParent,
                            emptyContainerChild,
                            mockField1,
                            mockField2,
                            mockDivider
                        ]
                    }
                ]
            };
            domain.getFormProperties = global.__mockPromise(mockFormForPermissions);

            const res = await domain.getRecordForm({
                libraryId: 'my_lib',
                recordId: '123456',
                formId: 'edition',
                ctx
            });

            expect(res).toEqual({
                id: 'edition',
                library: 'my_lib',
                recordId: '123456',
                system: false,
                dependencyAttributes: [],
                sidePanel: mockForm.sidePanel,
                elements: [
                    {...filledContainer, valueError: null, values: null},
                    {...mockField1, valueError: null, values: [mockStandardValue]}
                ]
            });
        });

        test('Handle tabs with not visible fields', async () => {
            const mockRecordDomainHandleDeps: Mockify<IRecordDomain> = {
                getRecordFieldValue: jest.fn().mockImplementation(async ({attributeId}) => {
                    switch (attributeId) {
                        case 'dep_attribute':
                            return {payload: {record: {id: '123456', library: 'dep_lib'}}};
                        default:
                            return mockStandardValue;
                    }
                })
            };

            const mockRecordAttributePermissionDomainForbidden: Mockify<IRecordAttributePermissionDomain> = {
                getRecordAttributePermission: jest.fn(async (action, userId, attributeId) => {
                    switch (attributeId) {
                        case 'allowed_attribute':
                            return true;
                        default:
                            return false;
                    }
                })
            };

            const domain = formDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomainHandleDeps as IRecordDomain,
                'core.domain.permission.recordAttribute':
                    mockRecordAttributePermissionDomainForbidden as IRecordAttributePermissionDomain
            });

            const mockTabs1 = {
                ...formLayoutElement,
                id: 'tabs1',
                uiElementType: FormUIElementTypes.TABS,
                settings: {
                    tabs: [
                        {
                            label: {en: 'Tab'},
                            id: 'first-tab'
                        },
                        {
                            label: {en: 'Tab'},
                            id: 'second-tab'
                        },
                        {
                            label: {en: 'Tab'},
                            id: 'third-tab'
                        }
                    ]
                }
            };
            const mockTabs2 = {
                ...formLayoutElement,
                id: 'tabs2',
                uiElementType: FormUIElementTypes.TABS,
                settings: {
                    tabs: [
                        {
                            label: {en: 'Tab'},
                            id: 'first-tab'
                        },
                        {
                            label: {en: 'Tab'},
                            id: 'second-tab'
                        }
                    ]
                }
            };
            const mockContainer = {
                ...formLayoutElement,
                id: 'container-in-tab',
                containerId: 'tabs1/second-tab'
            };

            const mockField1 = {
                ...formField,
                id: 'field1',
                containerId: 'tabs1/first-tab',
                settings: {attribute: 'allowed_attribute'}
            };

            const mockField2 = {
                ...formField,
                id: 'field2',
                containerId: 'container-in-tab',
                settings: {attribute: 'allowed_attribute'}
            };

            const mockField3 = {
                ...formField,
                id: 'field3',
                containerId: 'tabs2/first-tab',
                settings: {attribute: 'forbidden_attribute'}
            };

            const mockFormWithTabs: IForm = {
                ...mockForm,
                elements: [
                    {
                        elements: [mockTabs1, mockContainer, mockField1, mockField2, mockTabs2, mockField3]
                    }
                ]
            };
            domain.getFormProperties = global.__mockPromise(mockFormWithTabs);

            const res = await domain.getRecordForm({
                libraryId: 'my_lib',
                recordId: '123456',
                formId: 'edition',
                ctx
            });

            expect(res).toEqual({
                id: 'edition',
                library: 'my_lib',
                recordId: '123456',
                system: false,
                dependencyAttributes: [],
                sidePanel: mockForm.sidePanel,
                elements: [
                    {
                        ...mockTabs1,
                        settings: {
                            tabs: [
                                {
                                    label: {en: 'Tab'},
                                    id: 'first-tab'
                                },
                                {
                                    label: {en: 'Tab'},
                                    id: 'second-tab'
                                }
                            ]
                        },
                        valueError: null,
                        values: null
                    },
                    {...mockField1, valueError: null, values: [mockStandardValue]},
                    {...mockContainer, valueError: null, values: null},
                    {...mockField2, valueError: null, values: [mockStandardValue]}
                ]
            });
        });
    });
});
