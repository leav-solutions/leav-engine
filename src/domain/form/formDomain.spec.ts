import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IFormRepo} from 'infra/form/formRepo';
import {IUtils} from 'utils/utils';
import ValidationError from '../../errors/ValidationError';
import {mockAttrSimple} from '../../__tests__/mocks/attribute';
import {mockForm} from '../../__tests__/mocks/forms';
import {mockLibrary} from '../../__tests__/mocks/library';
import formDomain from './formDomain';

describe('formDomain', () => {
    const mockLibDomain: Mockify<ILibraryDomain> = {
        getLibraries: global.__mockPromise({list: [mockLibrary]})
    };

    const mockLibDomainNoLib: Mockify<ILibraryDomain> = {
        getLibraries: global.__mockPromise({list: []})
    };

    const mockAttrDomain: Mockify<IAttributeDomain> = {
        getAttributes: global.__mockPromise({list: [{...mockAttrSimple, id: 'test_attribute'}]})
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
                'core.infra.form': mockFormRepo as IFormRepo
            });

            const res = await domain.getFormsByLib('my_lib');

            expect(mockFormRepo.getForms).toBeCalled();
            expect(res).toEqual({list: [mockForm]});
        });

        test('If unknown library, throw validation error', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: []})
            };

            const domain = formDomain({
                'core.domain.library': mockLibDomainNoLib as ILibraryDomain,
                'core.infra.form': mockFormRepo as IFormRepo
            });

            await expect(domain.getFormsByLib('my_lib')).rejects.toThrow(ValidationError);
        });
    });

    describe('Get form properties', () => {
        test('Get form properties', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: [mockForm]})
            };

            const domain = formDomain({
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.form': mockFormRepo as IFormRepo
            });

            const res = await domain.getFormProperties('my_lib', 'edition_form');

            expect(mockFormRepo.getForms).toBeCalled();
            expect(res).toEqual(mockForm);
        });

        test('If unknown library, throw validation error', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: []})
            };

            const domain = formDomain({
                'core.domain.library': mockLibDomainNoLib as ILibraryDomain,
                'core.infra.form': mockFormRepo as IFormRepo
            });

            await expect(domain.getFormProperties('my_lib', 'edition_form')).rejects.toThrow(ValidationError);
        });

        test('If unknown form, throw validation error', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: []})
            };

            const domain = formDomain({
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.form': mockFormRepo as IFormRepo
            });

            await expect(domain.getFormProperties('my_lib', 'edition_form')).rejects.toThrow(ValidationError);
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
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.utils': mockUtils as IUtils
            });

            const createdForm = await domain.saveForm({...mockForm});

            expect(mockFormRepo.createForm).toBeCalled();
            expect(mockFormRepo.createForm.mock.calls[0][0].system).toBe(false);
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
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.utils': mockUtils as IUtils
            });

            const newLabel = {fr: 'New label'};
            await domain.saveForm({id: mockForm.id, library: mockForm.library, label: newLabel});

            expect(mockFormRepo.updateForm).toBeCalled();
            expect(mockFormRepo.updateForm.mock.calls[0][0]).toEqual({...mockForm, label: newLabel});
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
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(domain.saveForm({...mockForm})).rejects.toThrow(ValidationError);
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
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.utils': mockUtilsInvalidID as IUtils
            });

            await expect(domain.saveForm({...mockForm, id: 'invalid id'})).rejects.toThrow(ValidationError);
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
                'core.infra.form': mockFormRepo as IFormRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(domain.saveForm({...mockForm, id: 'invalid id'})).rejects.toThrow(ValidationError);
            expect(mockFormRepo.createForm).not.toBeCalled();
            expect(mockFormRepo.updateForm).not.toBeCalled();
        });

        // test('If not allowed, throw permission error', async () => {
        //     expect(false).toBe(true);
        // });
    });

    describe('Delete form', () => {
        test('Delete form', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: [mockForm]}),
                deleteForm: global.__mockPromise(mockForm)
            };

            const domain = formDomain({
                'core.infra.form': mockFormRepo as IFormRepo
            });

            const res = await domain.deleteForm('my_lib', 'edition_form');

            expect(mockFormRepo.deleteForm).toBeCalled();
            expect(res).toEqual(mockForm);
        });

        test('If unknown form, throw validation error', async () => {
            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: []}),
                deleteForm: jest.fn()
            };

            const domain = formDomain({
                'core.infra.form': mockFormRepo as IFormRepo
            });

            await expect(domain.deleteForm('my_lib', 'edition_form')).rejects.toThrow(ValidationError);
            expect(mockFormRepo.deleteForm).not.toBeCalled();
        });

        // test('If not allowed, throw permission error', async () => {
        //     expect(false).toBe(true);
        // });
    });
});
