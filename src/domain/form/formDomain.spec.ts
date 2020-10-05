import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {IFormRepo} from 'infra/form/formRepo';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {AppPermissionsActions} from '../../_types/permissions';
import {mockAttrSimple} from '../../__tests__/mocks/attribute';
import {mockForm} from '../../__tests__/mocks/forms';
import {mockLibrary} from '../../__tests__/mocks/library';
import formDomain from './formDomain';

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

    const mockAdminPermDomain: Mockify<IPermissionDomain> = {
        getAdminPermission: global.__mockPromise(true)
    };

    const mockUtils: Mockify<IUtils> = {
        validateID: jest.fn().mockReturnValue(true)
    };

    describe('Get forms by lib', () => {
        test('Get form by lib', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: [mockForm]})
            };

            const domain = formDomain({
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.domain.permission': mockAdminPermDomain as IPermissionDomain
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
                'core.domain.library': mockLibDomainNoLib as ILibraryDomain,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.domain.permission': mockAdminPermDomain as IPermissionDomain
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
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.domain.permission': mockAdminPermDomain as IPermissionDomain
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
                'core.domain.library': mockLibDomainNoLib as ILibraryDomain,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.domain.permission': mockAdminPermDomain as IPermissionDomain
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
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.domain.permission': mockAdminPermDomain as IPermissionDomain
            });

            await expect(domain.getFormProperties({library: 'my_lib', id: 'edition_form', ctx})).rejects.toThrow(
                ValidationError
            );
        });
    });

    describe('Save form', () => {
        test('Save new form', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: []}),
                updateForm: jest.fn(),
                createForm: global.__mockPromise(mockForm)
            };

            const domain = formDomain({
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission': mockAdminPermDomain as IPermissionDomain,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.utils': mockUtils as IUtils
            });

            const createdForm = await domain.saveForm({form: {...mockForm}, ctx});

            expect(mockFormRepo.createForm).toBeCalled();
            expect(mockFormRepo.createForm.mock.calls[0][0].formData.system).toBe(false);
            expect(mockFormRepo.updateForm).not.toBeCalled();
            expect(createdForm).toEqual(mockForm);
        });

        test('Save existing form', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: [mockForm]}),
                updateForm: global.__mockPromise(mockForm),
                createForm: jest.fn()
            };

            const domain = formDomain({
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission': mockAdminPermDomain as IPermissionDomain,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.utils': mockUtils as IUtils
            });

            const newLabel = {fr: 'New label'};
            await domain.saveForm({form: {id: mockForm.id, library: mockForm.library, label: newLabel}, ctx});

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
                'core.domain.library': mockLibDomainNoLib as ILibraryDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission': mockAdminPermDomain as IPermissionDomain,
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
                validateID: jest.fn().mockReturnValue(false)
            };

            const domain = formDomain({
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission': mockAdminPermDomain as IPermissionDomain,
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
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.attribute': mockAttrDomainNoMatch as IAttributeDomain,
                'core.domain.permission': mockAdminPermDomain as IPermissionDomain,
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
            const mockAdminPermForbiddenDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(false)
            };

            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: []}),
                updateForm: jest.fn(),
                createForm: global.__mockPromise(mockForm)
            };

            const domain = formDomain({
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission': mockAdminPermForbiddenDomain as IPermissionDomain,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(domain.saveForm({form: {...mockForm}, ctx})).rejects.toThrow(PermissionError);

            expect(mockAdminPermForbiddenDomain.getAdminPermission.mock.calls[0][0].action).toBe(
                AppPermissionsActions.CREATE_FORM
            );
            expect(mockFormRepo.createForm).not.toBeCalled();
            expect(mockFormRepo.updateForm).not.toBeCalled();
        });

        test('If edition not allowed, throw permission error', async () => {
            const mockAdminPermForbiddenDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(false)
            };

            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: [mockForm]}),
                updateForm: global.__mockPromise(mockForm),
                createForm: jest.fn()
            };

            const domain = formDomain({
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission': mockAdminPermForbiddenDomain as IPermissionDomain,
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(domain.saveForm({form: {...mockForm}, ctx})).rejects.toThrow(PermissionError);

            expect(mockAdminPermForbiddenDomain.getAdminPermission.mock.calls[0][0].action).toBe(
                AppPermissionsActions.EDIT_FORM
            );
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
                'core.domain.permission': mockAdminPermDomain as IPermissionDomain,
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
                'core.domain.permission': mockAdminPermDomain as IPermissionDomain,
                'core.infra.form': mockFormRepo as IFormRepo
            });

            await expect(domain.deleteForm({library: 'my_lib', id: 'edition_form', ctx})).rejects.toThrow(
                ValidationError
            );
            expect(mockFormRepo.deleteForm).not.toBeCalled();
        });

        test('If not allowed, throw permission error', async () => {
            const mockAdminPermForbiddenDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(false)
            };

            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: [mockForm]}),
                deleteForm: global.__mockPromise(mockForm)
            };

            const domain = formDomain({
                'core.domain.permission': mockAdminPermForbiddenDomain as IPermissionDomain,
                'core.infra.form': mockFormRepo as IFormRepo
            });

            await expect(domain.deleteForm({library: 'my_lib', id: 'edition_form', ctx})).rejects.toThrow(
                PermissionError
            );

            expect(mockAdminPermForbiddenDomain.getAdminPermission.mock.calls[0][0].action).toBe(
                AppPermissionsActions.DELETE_FORM
            );
            expect(mockFormRepo.deleteForm).not.toBeCalled();
        });
    });
});
