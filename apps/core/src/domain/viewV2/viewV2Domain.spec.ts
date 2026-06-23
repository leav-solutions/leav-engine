import {type IValidateHelper} from '../helpers/validate';
import {type IViewV2Repo} from '../../infra/viewV2/viewV2Repo';
import ValidationError from '../../errors/ValidationError';
import {mockCtx} from '../../__tests__/mocks/shared';
import viewV2Domain, {type IViewV2DomainDeps} from './viewV2Domain';
import {type ToAny} from '../../utils/utils';
import {SortOrder} from '../../_types/list';
import {AttributeCondition} from '../../_types/record';
import {type IViewV2, type IViewV2CreateInput, ViewV2Shortcut, ViewV2Types} from '../../_types/viewsV2';

const depsBase: ToAny<IViewV2DomainDeps> = {
    'core.domain.helpers.validate': vi.fn(),
    'core.domain.tree': vi.fn(),
    'core.infra.viewV2': vi.fn(),
    'core.utils': vi.fn(),
};

describe('viewV2Domain', () => {
    beforeEach(() => vi.clearAllMocks());

    const mockViewV2CreateInput: IViewV2CreateInput = {
        library: 'test_lib',
        label: {fr: 'My view'},
        display: {
            type: ViewV2Types.LIST,
            attributes: [
                {attributeId: 'id', visible: true},
                {attributeId: 'label', visible: true},
            ],
        },
        shared: true,
        filters: [
            {
                pinned: false,
                attributes: ['id'],
                values: ['fake_id_filter'],
                condition: AttributeCondition.EQUAL,
            },
        ],
        sorts: [{attributes: ['id'], order: SortOrder.ASC}],
        shortcuts: [ViewV2Shortcut.DISPLAY, ViewV2Shortcut.FILTERS],
    };

    const mockViewV2: IViewV2 = {
        ...mockViewV2CreateInput,
        id: 'test_view_v2',
        created_by: '1',
        created_at: 1234567890,
        modified_at: 1234567890,
        sorts: [
            {attributes: ['id'], order: SortOrder.ASC},
            {attributes: ['label'], order: SortOrder.ASC},
        ],
    };

    const mockViewV2Repo = {
        updateViewV2: global.__mockPromise({...mockViewV2}),
        createViewV2: global.__mockPromise({...mockViewV2}),
        deleteViewV2: global.__mockPromise({...mockViewV2}),
        getViewsOwnedOrSharedV2: global.__mockPromise({list: [{...mockViewV2}]}),
    } satisfies Mockify<IViewV2Repo>;

    const mockViewV2RepoNoView: Mockify<IViewV2Repo> = {
        getViewsOwnedOrSharedV2: global.__mockPromise({list: []}),
    };

    const mockValidationHelper: Mockify<IValidateHelper> = {
        validateLibrary: vi.fn(),
    };

    const mockValidationHelperInvalid: Mockify<IValidateHelper> = {
        validateLibrary: vi.fn().mockImplementation(() => {
            throw new ValidationError({validation: 'Invalid'});
        }),
    };

    describe('createViewV2', () => {
        test('Should create a new viewV2 and apply timestamps + ownership', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            const newView = await domain.createViewV2({...mockViewV2CreateInput}, mockCtx);

            expect(mockViewV2Repo.createViewV2).toBeCalled();
            expect(mockViewV2Repo.updateViewV2).not.toBeCalled();

            const passedToRepo = mockViewV2Repo.createViewV2.mock.calls[0][0];
            expect(passedToRepo.created_by).toBe(mockCtx.userId);
            expect(passedToRepo.created_at).toBeDefined();
            expect(passedToRepo.modified_at).toBe(passedToRepo.created_at);

            expect(newView).toMatchObject(mockViewV2);
        });

        test('Should apply default values to optional fields when omitted', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            await domain.createViewV2(
                {
                    library: 'test_lib',
                    label: {fr: 'My view'},
                    display: mockViewV2CreateInput.display,
                    shared: false,
                    filters: [],
                    sorts: [],
                    shortcuts: undefined,
                },
                mockCtx,
            );

            const passedToRepo = mockViewV2Repo.createViewV2.mock.calls[0][0];
            expect(passedToRepo.filters).toEqual([]);
            expect(passedToRepo.sorts).toEqual([]);
            expect(passedToRepo.shortcuts).toEqual([ViewV2Shortcut.DISPLAY]);
        });

        test('Should persist the provided shortcuts list', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            await domain.createViewV2(
                {
                    ...mockViewV2CreateInput,
                    shortcuts: [ViewV2Shortcut.DISPLAY, ViewV2Shortcut.SORTS, ViewV2Shortcut.CATALOG],
                },
                mockCtx,
            );

            const passedToRepo = mockViewV2Repo.createViewV2.mock.calls[0][0];
            expect(passedToRepo.shortcuts).toEqual([
                ViewV2Shortcut.DISPLAY,
                ViewV2Shortcut.SORTS,
                ViewV2Shortcut.CATALOG,
            ]);
        });

        test('Should throw if library is unknown', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidationHelperInvalid as IValidateHelper,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            await expect(domain.createViewV2({...mockViewV2CreateInput}, mockCtx)).rejects.toThrow(ValidationError);
            expect(mockViewV2Repo.createViewV2).not.toBeCalled();
        });

        test('Should throw ValidationError when input shape is invalid and skip downstream checks', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            await expect(
                domain.createViewV2(
                    {
                        ...mockViewV2CreateInput,
                        display: {...mockViewV2CreateInput.display, type: 'invalid' as ViewV2Types},
                    },
                    mockCtx,
                ),
            ).rejects.toThrow(ValidationError);
            expect(mockValidationHelper.validateLibrary).not.toBeCalled();
            expect(mockViewV2Repo.createViewV2).not.toBeCalled();
        });

        test('Should throw ValidationError when a sort has no attributes', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            await expect(
                domain.createViewV2(
                    {...mockViewV2CreateInput, sorts: [{attributes: [], order: SortOrder.ASC}]},
                    mockCtx,
                ),
            ).rejects.toThrow(ValidationError);
            expect(mockViewV2Repo.createViewV2).not.toBeCalled();
        });
    });

    describe('updateViewV2', () => {
        test('Should update an existing viewV2 owned by the user', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            const updated = await domain.updateViewV2({id: mockViewV2.id, shared: false}, mockCtx);

            expect(mockViewV2Repo.updateViewV2).toBeCalled();
            expect(mockViewV2Repo.createViewV2).not.toBeCalled();

            const passedToRepo = mockViewV2Repo.updateViewV2.mock.calls[0][0];
            expect(passedToRepo.id).toBe(mockViewV2.id);
            expect(passedToRepo.shared).toBe(false);
            expect(passedToRepo.modified_at).toBeDefined();

            expect(updated).toMatchObject(mockViewV2);
        });

        test('Should throw if viewV2 is unknown', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                'core.infra.viewV2': mockViewV2RepoNoView as IViewV2Repo,
            });

            await expect(domain.updateViewV2({id: 'unknown_view'}, mockCtx)).rejects.toThrow(ValidationError);
        });

        test('Should throw if user is not the owner', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            await expect(domain.updateViewV2({id: mockViewV2.id}, {...mockCtx, userId: '42'})).rejects.toThrow(
                ValidationError,
            );
        });

        test('Should throw ValidationError when update payload shape is invalid and skip downstream checks', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            await expect(
                domain.updateViewV2(
                    {id: mockViewV2.id, display: {type: 'invalid' as ViewV2Types, attributes: []}},
                    mockCtx,
                ),
            ).rejects.toThrow(ValidationError);
            expect(mockValidationHelper.validateLibrary).not.toBeCalled();
            expect(mockViewV2Repo.getViewsOwnedOrSharedV2).not.toBeCalled();
            expect(mockViewV2Repo.updateViewV2).not.toBeCalled();
        });

        test('Should validate library only when it is provided in the update payload', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidationHelper as IValidateHelper,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            await domain.updateViewV2({id: mockViewV2.id, shared: false}, mockCtx);
            expect(mockValidationHelper.validateLibrary).not.toBeCalled();

            await domain.updateViewV2({id: mockViewV2.id, library: 'other_lib'}, mockCtx);
            expect(mockValidationHelper.validateLibrary).toBeCalledWith('other_lib', mockCtx);
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

            expect(mockViewV2Repo.getViewsOwnedOrSharedV2).toBeCalled();
            expect(mockViewV2Repo.getViewsOwnedOrSharedV2.mock.calls[0][0].filters.created_by).toBe(mockCtx.userId);
            expect(views.list[0]).toEqual(mockViewV2);
        });

        test('Should throw if unknown library', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidationHelperInvalid as IValidateHelper,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            await expect(domain.getViewsV2('bad_lib', mockCtx)).rejects.toThrow(ValidationError);
            expect(mockViewV2Repo.getViewsOwnedOrSharedV2).not.toBeCalled();
        });
    });

    describe('getViewV2ById', () => {
        test('Return viewV2 by ID', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            const view = await domain.getViewV2ById('123456', mockCtx);

            expect(mockViewV2Repo.getViewsOwnedOrSharedV2).toBeCalled();
            expect(mockViewV2Repo.getViewsOwnedOrSharedV2.mock.calls[0][0].filters.id).toBe('123456');
            expect(view).toEqual(mockViewV2);
        });

        test('Should throw if unknown viewV2', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.infra.viewV2': mockViewV2RepoNoView as IViewV2Repo,
            });

            await expect(domain.getViewV2ById('bad_view', mockCtx)).rejects.toThrow(ValidationError);
            expect(mockViewV2RepoNoView.getViewsOwnedOrSharedV2).toBeCalled();
        });
    });

    describe('deleteViewV2', () => {
        test('Should delete a viewV2', async () => {
            const domain = viewV2Domain({
                ...depsBase,
                'core.infra.viewV2': mockViewV2Repo as IViewV2Repo,
            });

            const deleted = await domain.deleteViewV2(mockViewV2.id, mockCtx);

            expect(mockViewV2Repo.deleteViewV2).toBeCalled();
            expect(deleted).toEqual(mockViewV2);
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
