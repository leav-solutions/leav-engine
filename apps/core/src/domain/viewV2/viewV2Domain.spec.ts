// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IValidateHelper} from '../helpers/validate';
import {type IViewV2Repo} from '../../infra/viewV2/viewV2Repo';
import ValidationError from '../../errors/ValidationError';
import {mockCtx} from '../../__tests__/mocks/shared';
import {mockViewV2, mockViewV2BeforeCreation} from '../../__tests__/mocks/viewV2';
import viewV2Domain, {type IViewV2DomainDeps} from './viewV2Domain';
import {type ToAny} from '../../utils/utils';

const depsBase: ToAny<IViewV2DomainDeps> = {
    'core.domain.helpers.validate': vi.fn(),
    'core.domain.tree': vi.fn(),
    'core.infra.viewV2': vi.fn(),
    'core.utils': vi.fn(),
};

describe('viewV2Domain', () => {
    beforeEach(() => vi.clearAllMocks());

    const mockViewV2Repo = {
        updateViewV2: global.__mockPromise({...mockViewV2}),
        createViewV2: global.__mockPromise({...mockViewV2}),
        deleteViewV2: global.__mockPromise({...mockViewV2}),
        getViewsV2: global.__mockPromise({list: [{...mockViewV2}]}),
    } satisfies Mockify<IViewV2Repo>;

    const mockViewV2RepoNoView: Mockify<IViewV2Repo> = {
        getViewsV2: global.__mockPromise({list: []}),
    };

    const mockValidationHelper: Mockify<IValidateHelper> = {
        validateLibrary: vi.fn(),
    };

    const mockValidationHelperInvalid: Mockify<IValidateHelper> = {
        validateLibrary: vi.fn().mockImplementation(() => {
            throw new ValidationError({validation: 'Invalid'});
        }),
    };

    describe('saveViewV2', () => {
        describe('Update viewV2', () => {
            test('Should update viewV2', async () => {
                const domain = viewV2Domain({
                    ...depsBase,
                    'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                    'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
                });

                const updatedView = await domain.saveViewV2({...mockViewV2}, mockCtx);

                expect(mockViewV2Repo.updateViewV2).toBeCalled();
                expect(mockViewV2Repo.createViewV2).not.toBeCalled();

                const viewPassedToRepo = mockViewV2Repo.updateViewV2.mock.calls[0][0];
                expect(viewPassedToRepo.modified_at).toBeDefined();
                expect(viewPassedToRepo.modified_at).not.toBe(viewPassedToRepo.created_at);

                expect(updatedView).toMatchObject(mockViewV2);
            });

            test('Should throw if unknown viewV2', async () => {
                const domain = viewV2Domain({
                    ...depsBase,
                    'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                    'core.infra.viewV2': mockViewV2RepoNoView as IViewV2Repo,
                });

                await expect(domain.saveViewV2({...mockViewV2}, mockCtx)).rejects.toThrow(ValidationError);
            });

            test('Should throw if user is not owner of this viewV2', async () => {
                const domain = viewV2Domain({
                    ...depsBase,
                    'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                    'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
                });

                await expect(domain.saveViewV2({...mockViewV2}, {...mockCtx, userId: '42'})).rejects.toThrow(
                    ValidationError,
                );
            });
        });

        describe('Create viewV2', () => {
            test('Should create new viewV2', async () => {
                const domain = viewV2Domain({
                    ...depsBase,
                    'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                    'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
                });

                const viewToCreate = {...mockViewV2BeforeCreation};

                const newView = await domain.saveViewV2(viewToCreate, mockCtx);

                expect(mockViewV2Repo.createViewV2).toBeCalled();
                expect(mockViewV2Repo.updateViewV2).not.toBeCalled();

                const viewPassedToRepo = mockViewV2Repo.createViewV2.mock.calls[0][0];
                expect(viewPassedToRepo.created_by).toBe(mockCtx.userId);
                expect(viewPassedToRepo.created_at).toBeDefined();
                expect(viewPassedToRepo.modified_at).toBe(viewPassedToRepo.created_at);

                expect(newView).toMatchObject(mockViewV2);
            });

            test('Should throw if unknown library', async () => {
                const domain = viewV2Domain({
                    ...depsBase,
                    'core.domain.helpers.validate': mockValidationHelperInvalid as IValidateHelper,
                    'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
                });

                const viewToCreate = {...mockViewV2BeforeCreation};

                await expect(domain.saveViewV2(viewToCreate, mockCtx)).rejects.toThrow(ValidationError);
            });
        });
    });

    describe('getViewsV2', () => {
        test('Should get viewsV2 for current user', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            const views = await domain.getViewsV2('test_lib', mockCtx);

            expect(mockViewV2Repo.getViewsV2).toBeCalled();
            expect(mockViewV2Repo.getViewsV2.mock.calls[0][0].filters.created_by).toBe(mockCtx.userId);
            expect(views.list[0]).toEqual(mockViewV2);
        });

        test('Should throw if unknown library', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidationHelperInvalid as IValidateHelper,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            await expect(domain.getViewsV2('bad_lib', mockCtx)).rejects.toThrow(ValidationError);
            expect(mockViewV2Repo.getViewsV2).not.toBeCalled();
        });
    });

    describe('getViewV2ById', () => {
        test('Return viewV2 by ID', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            const view = await domain.getViewV2ById('123456', mockCtx);

            expect(mockViewV2Repo.getViewsV2).toBeCalled();
            expect(mockViewV2Repo.getViewsV2.mock.calls[0][0].filters.id).toBe('123456');
            expect(view).toEqual(mockViewV2);
        });

        test('Should throw if unknown viewV2', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.infra.viewV2': mockViewV2RepoNoView as IViewV2Repo,
            });

            await expect(domain.getViewV2ById('bad_view', mockCtx)).rejects.toThrow(ValidationError);
            expect(mockViewV2RepoNoView.getViewsV2).toBeCalled();
        });
    });

    describe('deleteViewV2', () => {
        test('Should delete a viewV2', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            const deletedView = await domain.deleteViewV2(mockViewV2.id, mockCtx);

            expect(mockViewV2Repo.deleteViewV2).toBeCalled();
            expect(deletedView).toEqual(mockViewV2);
        });

        test('Should throw if viewV2 does not exist', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.infra.viewV2': mockViewV2RepoNoView as IViewV2Repo,
            });

            await expect(domain.deleteViewV2(mockViewV2.id, mockCtx)).rejects.toThrow(ValidationError);
            expect(mockViewV2Repo.deleteViewV2).not.toBeCalled();
        });

        test('Should throw if user is not owner of this viewV2', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            await expect(domain.deleteViewV2(mockViewV2.id, {...mockCtx, userId: '42'})).rejects.toThrow(
                ValidationError,
            );
            expect(mockViewV2Repo.deleteViewV2).not.toBeCalled();
        });
    });
});
