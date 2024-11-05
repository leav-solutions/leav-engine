// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ICacheService, ICachesService} from 'infra/cache/cacheService';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IVersionProfileRepo} from 'infra/versionProfile/versionProfileRepo';
import {IUtils, ToAny} from 'utils/utils';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {AdminPermissionsActions} from '../../_types/permissions';
import {mockAttrAdvVersionable} from '../../__tests__/mocks/attribute';
import {mockCtx} from '../../__tests__/mocks/shared';
import {mockTree} from '../../__tests__/mocks/tree';
import {mockVersionProfile} from '../../__tests__/mocks/versionProfile';
import versionProfileDomain, {IVersionProfileDomainDeps} from './versionProfileDomain';

const depsBase: ToAny<IVersionProfileDomainDeps> = {
    'core.domain.permission.admin': jest.fn(),
    'core.domain.helpers.getCoreEntityById': jest.fn(),
    'core.domain.eventsManager': jest.fn(),
    'core.infra.versionProfile': jest.fn(),
    'core.infra.tree': jest.fn(),
    'core.infra.attribute': jest.fn(),
    'core.infra.cache.cacheService': jest.fn(),
    'core.utils': jest.fn()
};

describe('versionProfileDomain', () => {
    const mockAdminPermDomain = {
        getAdminPermission: global.__mockPromise(true)
    } satisfies Mockify<IAdminPermissionDomain>;

    const mockAdminPermDomainForbidden: Mockify<IAdminPermissionDomain> = {
        getAdminPermission: global.__mockPromise(false)
    };

    const mockTreeRepo: Mockify<ITreeRepo> = {
        getTrees: global.__mockPromise({
            list: [
                {...mockTree, id: 'treeA'},
                {...mockTree, id: 'treeB'}
            ]
        })
    };

    const mockCacheService: Mockify<ICacheService> = {
        getData: global.__mockPromise([null]),
        storeData: global.__mockPromise(),
        deleteData: global.__mockPromise()
    };

    const mockCachesService: Mockify<ICachesService> = {
        getCache: jest.fn().mockReturnValue(mockCacheService)
    };

    const mockGetEntityByIdHelper = jest.fn().mockReturnValue(mockVersionProfile);
    const mockGetEntityByIdHelperNoProfile = jest.fn().mockReturnValue(null);

    const mockUtils: Mockify<IUtils> = {
        isIdValid: jest.fn().mockReturnValue(true),
        generateExplicitValidationError: jest.fn().mockReturnValue(new ValidationError({}, '')),
        getCoreEntityCacheKey: jest.fn().mockReturnValue('coreEntity:versionProfile:42')
    };

    const mockEventsManager: Mockify<IEventsManagerDomain> = {
        sendDatabaseEvent: global.__mockPromise()
    };

    beforeEach(() => jest.clearAllMocks());

    describe('getVersionProfiles', () => {
        test('Should return a list of version profiles', async () => {
            const mockRepo = {
                getVersionProfiles: global.__mockPromise({
                    totalCount: 2,
                    list: [
                        {...mockVersionProfile, id: 'profile1'},
                        {...mockVersionProfile, id: 'profile2'}
                    ]
                })
            };

            const domain = versionProfileDomain({
                ...depsBase,
                'core.infra.versionProfile': mockRepo as IVersionProfileRepo
            });

            const profiles = await domain.getVersionProfiles({ctx: mockCtx});

            expect(mockRepo.getVersionProfiles.mock.calls.length).toBe(1);
            expect(mockRepo.getVersionProfiles.mock.calls[0][0]).toMatchObject({ctx: mockCtx});

            expect(profiles.list).toHaveLength(2);
            expect(profiles.list[0].id).toBe('profile1');
            expect(profiles.list[1].id).toBe('profile2');
        });
    });

    describe('getVersionProfileProperties', () => {
        test('Should return a version profile by id', async () => {
            const mockRepo = {
                getVersionProfiles: global.__mockPromise({list: [mockVersionProfile]})
            };

            const domain = versionProfileDomain({
                ...depsBase,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.infra.versionProfile': mockRepo as IVersionProfileRepo
            });

            const profile = await domain.getVersionProfileProperties({id: mockVersionProfile.id, ctx: mockCtx});

            expect(mockGetEntityByIdHelper).toBeCalled();

            expect(profile).toEqual(mockVersionProfile);
        });

        test('Should throw if unknown profile', async () => {
            const mockRepo = {
                getVersionProfiles: global.__mockPromise({list: []})
            };

            const domain = versionProfileDomain({
                ...depsBase,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoProfile,
                'core.infra.versionProfile': mockRepo as IVersionProfileRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(async () =>
                domain.getVersionProfileProperties({id: mockVersionProfile.id, ctx: mockCtx})
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('saveVersionProfile', () => {
        test('Should create a new version profile', async () => {
            const mockVersionProfileRepo: Mockify<IVersionProfileRepo> = {
                getVersionProfiles: global.__mockPromise({list: []}),
                createVersionProfile: global.__mockPromise(mockVersionProfile),
                updateVersionProfile: global.__mockPromise(mockVersionProfile)
            };

            const domain = versionProfileDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.versionProfile': mockVersionProfileRepo as IVersionProfileRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.utils': mockUtils as IUtils
            });

            const profile = await domain.saveVersionProfile({
                versionProfile: mockVersionProfile,
                ctx: mockCtx
            });

            expect(mockVersionProfileRepo.createVersionProfile).toBeCalled();
            expect(mockVersionProfileRepo.updateVersionProfile).not.toBeCalled();

            expect(mockAdminPermDomain.getAdminPermission).toBeCalled();
            expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0].action).toBe(
                AdminPermissionsActions.CREATE_VERSION_PROFILE
            );

            expect(profile).toEqual(mockVersionProfile);
        });

        test('Should update an existing version profile', async () => {
            const mockVersionProfileRepo: Mockify<IVersionProfileRepo> = {
                getVersionProfiles: global.__mockPromise({list: [mockVersionProfile]}),
                createVersionProfile: global.__mockPromise(mockVersionProfile),
                updateVersionProfile: global.__mockPromise(mockVersionProfile)
            };

            const domain = versionProfileDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.versionProfile': mockVersionProfileRepo as IVersionProfileRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.infra.cache.cacheService': mockCachesService as ICachesService,
                'core.utils': mockUtils as IUtils
            });

            const profile = await domain.saveVersionProfile({
                versionProfile: mockVersionProfile,
                ctx: mockCtx
            });

            expect(mockVersionProfileRepo.updateVersionProfile).toBeCalled();
            expect(mockVersionProfileRepo.createVersionProfile).not.toBeCalled();

            expect(mockAdminPermDomain.getAdminPermission).toBeCalled();
            expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0].action).toBe(
                AdminPermissionsActions.EDIT_VERSION_PROFILE
            );

            expect(profile).toEqual(mockVersionProfile);
        });

        test('Should throw if not allowed to save a profile', async () => {
            const mockVersionProfileRepo: Mockify<IVersionProfileRepo> = {
                getVersionProfiles: global.__mockPromise({list: []}),
                createVersionProfile: global.__mockPromise(mockVersionProfile),
                updateVersionProfile: global.__mockPromise(mockVersionProfile)
            };

            const domain = versionProfileDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermDomainForbidden as IAdminPermissionDomain,
                'core.infra.versionProfile': mockVersionProfileRepo as IVersionProfileRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(async () =>
                domain.saveVersionProfile({
                    versionProfile: mockVersionProfile,
                    ctx: mockCtx
                })
            ).rejects.toThrow(PermissionError);

            expect(mockVersionProfileRepo.updateVersionProfile).not.toBeCalled();
            expect(mockVersionProfileRepo.createVersionProfile).not.toBeCalled();
        });

        test('Should throw if id is not valid', async () => {
            const mockVersionProfileRepo: Mockify<IVersionProfileRepo> = {
                getVersionProfiles: global.__mockPromise({list: []}),
                createVersionProfile: global.__mockPromise(mockVersionProfile),
                updateVersionProfile: global.__mockPromise(mockVersionProfile)
            };

            const mockUtilsInvalidId: Mockify<IUtils> = {
                ...mockUtils,
                isIdValid: jest.fn().mockReturnValue(false)
            };

            const domain = versionProfileDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.infra.versionProfile': mockVersionProfileRepo as IVersionProfileRepo,
                'core.utils': mockUtilsInvalidId as IUtils
            });

            await expect(async () =>
                domain.saveVersionProfile({
                    versionProfile: {...mockVersionProfile, id: 'INVALID ID'},
                    ctx: mockCtx
                })
            ).rejects.toThrow(ValidationError);

            expect(mockVersionProfileRepo.createVersionProfile).not.toBeCalled();
            expect(mockVersionProfileRepo.updateVersionProfile).not.toBeCalled();
        });

        test('Should throw if unknown tree in settings', async () => {
            const mockVersionProfileRepo: Mockify<IVersionProfileRepo> = {
                getVersionProfiles: global.__mockPromise({list: [mockVersionProfile]}),
                createVersionProfile: global.__mockPromise(mockVersionProfile),
                updateVersionProfile: global.__mockPromise(mockVersionProfile)
            };

            const mockTreeRepoUnknownTree: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: []})
            };

            const domain = versionProfileDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.infra.versionProfile': mockVersionProfileRepo as IVersionProfileRepo,
                'core.infra.tree': mockTreeRepoUnknownTree as ITreeRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(async () =>
                domain.saveVersionProfile({
                    versionProfile: mockVersionProfile,
                    ctx: mockCtx
                })
            ).rejects.toThrow(ValidationError);

            expect(mockVersionProfileRepo.updateVersionProfile).not.toBeCalled();
            expect(mockVersionProfileRepo.createVersionProfile).not.toBeCalled();
        });
    });

    describe('deleteVersionProfile', () => {
        test('Should delete a version profile', async () => {
            const mockVersionProfileRepo: Mockify<IVersionProfileRepo> = {
                getVersionProfiles: global.__mockPromise({list: [mockVersionProfile]}),
                deleteVersionProfile: global.__mockPromise(mockVersionProfile)
            };

            const mockAttributeRepo: Mockify<IAttributeRepo> = {
                updateAttribute: global.__mockPromise(mockAttrAdvVersionable)
            };

            const domain = versionProfileDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.versionProfile': mockVersionProfileRepo as IVersionProfileRepo,
                'core.infra.attribute': mockAttributeRepo as IAttributeRepo
            });
            domain.getAttributesUsingProfile = global.__mockPromise([mockAttrAdvVersionable]);

            const profile = await domain.deleteVersionProfile({
                id: mockVersionProfile.id,
                ctx: mockCtx
            });

            expect(mockVersionProfileRepo.deleteVersionProfile).toBeCalled();

            expect(mockAdminPermDomain.getAdminPermission).toBeCalled();
            expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0].action).toBe(
                AdminPermissionsActions.DELETE_VERSION_PROFILE
            );

            expect(profile).toEqual(mockVersionProfile);

            // Remove profile from attribute it's used
            expect(domain.getAttributesUsingProfile).toBeCalled();
            expect(mockAttributeRepo.updateAttribute).toBeCalled();
        });

        test('Should throw if unknown profile', async () => {
            const mockVersionProfileRepo: Mockify<IVersionProfileRepo> = {
                getVersionProfiles: global.__mockPromise({list: []}),
                deleteVersionProfile: global.__mockPromise(mockVersionProfile)
            };

            const domain = versionProfileDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.infra.versionProfile': mockVersionProfileRepo as IVersionProfileRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(async () =>
                domain.deleteVersionProfile({
                    id: mockVersionProfile.id,
                    ctx: mockCtx
                })
            ).rejects.toThrow(ValidationError);

            expect(mockVersionProfileRepo.deleteVersionProfile).not.toBeCalled();
        });

        test('Should throw if not allowed to delete profile', async () => {
            const mockVersionProfileRepo: Mockify<IVersionProfileRepo> = {
                getVersionProfiles: global.__mockPromise({list: [mockVersionProfile]}),
                deleteVersionProfile: global.__mockPromise(mockVersionProfile)
            };

            const domain = versionProfileDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermDomainForbidden as IAdminPermissionDomain,
                'core.infra.versionProfile': mockVersionProfileRepo as IVersionProfileRepo,
                'core.utils': mockUtils as IUtils
            });

            await expect(async () =>
                domain.deleteVersionProfile({
                    id: mockVersionProfile.id,
                    ctx: mockCtx
                })
            ).rejects.toThrow(PermissionError);

            expect(mockVersionProfileRepo.deleteVersionProfile).not.toBeCalled();
        });
    });

    describe('getAttributesUsingProfile', () => {
        test('Should get attributes using profile', async () => {
            const mockVersionProfileRepo: Mockify<IVersionProfileRepo> = {
                getAttributesUsingProfile: global.__mockPromise([mockAttrAdvVersionable])
            };

            const domain = versionProfileDomain({
                ...depsBase,
                'core.infra.versionProfile': mockVersionProfileRepo as IVersionProfileRepo
            });

            const attributes = await domain.getAttributesUsingProfile({
                id: mockVersionProfile.id,
                ctx: mockCtx
            });

            expect(mockVersionProfileRepo.getAttributesUsingProfile).toBeCalled();

            expect(attributes).toEqual([mockAttrAdvVersionable]);
        });
    });
});
