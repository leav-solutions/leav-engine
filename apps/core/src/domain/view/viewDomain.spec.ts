// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IValidateHelper} from 'domain/helpers/validate';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IViewRepo} from 'infra/view/_types';
import ValidationError from '../../errors/ValidationError';
import {mockLibrary} from '../../__tests__/mocks/library';
import {mockCtx} from '../../__tests__/mocks/shared';
import {mockView, mockViewBeforeCreation} from '../../__tests__/mocks/view';
import viewDomain from './viewDomain';

describe('viewDomain', () => {
    beforeEach(() => jest.clearAllMocks());

    const mockViewRepo: Mockify<IViewRepo> = {
        updateView: global.__mockPromise({...mockView}),
        createView: global.__mockPromise({...mockView}),
        deleteView: global.__mockPromise({...mockView}),
        getViews: global.__mockPromise({list: [{...mockView}]})
    };

    const mockViewRepoNoView: Mockify<IViewRepo> = {
        getViews: global.__mockPromise({list: []})
    };

    const mockLibDomain: Mockify<ILibraryDomain> = {
        getLibraries: global.__mockPromise({list: [{...mockLibrary}], totalCount: 1})
    };

    const mockLibDomainNoLib: Mockify<ILibraryDomain> = {
        getLibraries: global.__mockPromise({list: [], totalCount: 0})
    };

    const mockValidationHelper: Mockify<IValidateHelper> = {
        validateLibrary: jest.fn()
    };

    const mockValidationHelperInvalid: Mockify<IValidateHelper> = {
        validateLibrary: jest.fn().mockImplementation(() => {
            throw new ValidationError(null);
        })
    };

    describe('saveView', () => {
        describe('Update view', () => {
            test('Should update view', async () => {
                const domain = viewDomain({
                    'core.domain.library': mockLibDomain as ILibraryDomain,
                    'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                    'core.infra.view': mockViewRepo as IViewRepo
                });

                const updatedView = await domain.saveView({...mockView}, mockCtx);

                expect(mockViewRepo.updateView).toBeCalled();
                expect(mockViewRepo.createView).not.toBeCalled();

                const viewPassedToRepo = mockViewRepo.updateView.mock.calls[0][0];
                expect(viewPassedToRepo.modified_at).toBeDefined();
                expect(viewPassedToRepo.modified_at).not.toBe(viewPassedToRepo.created_at);

                expect(updatedView).toMatchObject(mockView);
            });

            test('Should throw if unknown view', async () => {
                const domain = viewDomain({
                    'core.domain.library': mockLibDomain as ILibraryDomain,
                    'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                    'core.infra.view': mockViewRepoNoView as IViewRepo
                });

                await expect(domain.saveView({...mockView}, mockCtx)).rejects.toThrow(ValidationError);
            });

            test('Should throw if user is not owner of this view', async () => {
                const domain = viewDomain({
                    'core.domain.library': mockLibDomain as ILibraryDomain,
                    'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                    'core.infra.view': mockViewRepo as IViewRepo
                });

                await expect(domain.saveView({...mockView}, {...mockCtx, userId: '42'})).rejects.toThrow(
                    ValidationError
                );
            });
        });

        describe('Create view', () => {
            test('Should create new view', async () => {
                const domain = viewDomain({
                    'core.domain.library': mockLibDomain as ILibraryDomain,
                    'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                    'core.infra.view': mockViewRepo as IViewRepo
                });

                const viewToCreate = {...mockViewBeforeCreation};

                const newView = await domain.saveView(viewToCreate, mockCtx);

                expect(mockViewRepo.createView).toBeCalled();
                expect(mockViewRepo.updateView).not.toBeCalled();

                const viewPassedToRepo = mockViewRepo.createView.mock.calls[0][0];
                expect(viewPassedToRepo.created_by).toBe(mockCtx.userId);
                expect(viewPassedToRepo.created_at).toBeDefined();
                expect(viewPassedToRepo.modified_at).toBe(viewPassedToRepo.created_at);

                expect(newView).toMatchObject(mockView);
            });

            test('Should throw if unknown library', async () => {
                const domain = viewDomain({
                    'core.domain.library': mockLibDomainNoLib as ILibraryDomain,
                    'core.domain.helpers.validate': mockValidationHelperInvalid as IValidateHelper,
                    'core.infra.view': mockViewRepo as IViewRepo
                });

                const viewToCreate = {...mockViewBeforeCreation};

                await expect(domain.saveView(viewToCreate, mockCtx)).rejects.toThrow(ValidationError);
            });
        });
    });

    describe('getViews', () => {
        test('Should get views for current user', async () => {
            const domain = viewDomain({
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                'core.infra.view': mockViewRepo as IViewRepo
            });

            const views = await domain.getViews('test_lib', mockCtx);

            expect(mockViewRepo.getViews).toBeCalled();
            expect(mockViewRepo.getViews.mock.calls[0][0].filters.created_by).toBe(mockCtx.userId);
            expect(views.list[0]).toEqual(mockView);
        });

        test('Should throw if unknown library', async () => {
            const domain = viewDomain({
                'core.domain.library': mockLibDomainNoLib as ILibraryDomain,
                'core.domain.helpers.validate': mockValidationHelperInvalid as IValidateHelper,
                'core.infra.view': mockViewRepo as IViewRepo
            });

            await expect(domain.getViews('bad_lib', mockCtx)).rejects.toThrow(ValidationError);
            expect(mockViewRepo.getViews).not.toBeCalled();
        });
    });

    describe('getViewById', () => {
        test('Return view by ID', async () => {
            const domain = viewDomain({
                'core.infra.view': mockViewRepo as IViewRepo
            });

            const view = await domain.getViewById('123456', mockCtx);

            expect(mockViewRepo.getViews).toBeCalled();
            expect(mockViewRepo.getViews.mock.calls[0][0].filters.id).toBe('123456');
            expect(view).toEqual(mockView);
        });

        test('Should throw if unknown view', async () => {
            const domain = viewDomain({
                'core.infra.view': mockViewRepoNoView as IViewRepo
            });

            await expect(domain.getViewById('bad_view', mockCtx)).rejects.toThrow(ValidationError);
            expect(mockViewRepoNoView.getViews).toBeCalled();
        });
    });

    describe('deleteView', () => {
        test('Should delete a view', async () => {
            const domain = viewDomain({
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.view': mockViewRepo as IViewRepo
            });

            const deletedView = await domain.deleteView(mockView.id, mockCtx);

            expect(mockViewRepo.deleteView).toBeCalled();
            expect(deletedView).toEqual(mockView);
        });

        test('Should throw if view does not exist', async () => {
            const domain = viewDomain({
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.view': mockViewRepoNoView as IViewRepo
            });

            await expect(domain.deleteView(mockView.id, mockCtx)).rejects.toThrow(ValidationError);
            expect(mockViewRepo.deleteView).not.toBeCalled();
        });

        test('Should throw if user is not owner of this view', async () => {
            const domain = viewDomain({
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.view': mockViewRepo as IViewRepo
            });

            await expect(domain.deleteView(mockView.id, {...mockCtx, userId: '42'})).rejects.toThrow(ValidationError);
            expect(mockViewRepo.deleteView).not.toBeCalled();
        });
    });
});
