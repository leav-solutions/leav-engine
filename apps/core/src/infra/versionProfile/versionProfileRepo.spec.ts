// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {IDbUtils} from 'infra/db/dbUtils';
import {mockAttrAdvVersionable} from '../../__tests__/mocks/attribute';
import {mockCtx} from '../../__tests__/mocks/shared';
import versionProfileRepo from './versionProfileRepo';

describe('versionProfileRepo', () => {
    const docProfileData = {
        _key: 'test_profile',
        label: {fr: 'Test'},
        trees: ['treeA', 'treeB']
    };

    const profileData = {
        id: 'test_profile',
        label: {fr: 'Test'},
        trees: ['treeA', 'treeB']
    };

    const mockDbUtils = {
        cleanup: jest.fn().mockReturnValue(profileData),
        convertToDoc: jest.fn().mockReturnValue(docProfileData),
        findCoreEntity: global.__mockPromise([profileData])
    } satisfies Mockify<IDbUtils>;

    describe('createVersionProfile', () => {
        test('Should create a new version profile', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docProfileData])
            };

            const repo = versionProfileRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const createdProfile = await repo.createVersionProfile({profileData, ctx: mockCtx});
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(createdProfile).toMatchObject(profileData);
        });
    });

    describe('updateVersionProfile', () => {
        test('Should update an existing version profile', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docProfileData])
            };

            const repo = versionProfileRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const updatedProfile = await repo.updateVersionProfile({profileData, ctx: mockCtx});
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(updatedProfile).toMatchObject(profileData);
        });
    });

    describe('getVersionProfiles', () => {
        test('Should return a list of version profiles', async () => {
            const mockDbServ = {execute: global.__mockPromise([])};

            const repo = versionProfileRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const profiles = await repo.getVersionProfiles({ctx: mockCtx});

            expect(mockDbUtils.findCoreEntity.mock.calls.length).toBe(1);
            expect(profiles).toEqual([profileData]);
        });
    });

    describe('Delete versionProfile', () => {
        test('Should delete a version profile', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docProfileData])
            };

            const repo = versionProfileRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const deletedProfile = await repo.deleteVersionProfile({id: profileData.id, ctx: mockCtx});

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(deletedProfile).toMatchObject(profileData);
        });
    });

    describe('getAttributesUsingProfile', () => {
        test('Should return a list of attributes using a profile', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([mockAttrAdvVersionable])
            };

            const mockDbUtilsAttribute: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(mockAttrAdvVersionable)
            };

            const repo = versionProfileRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtilsAttribute as IDbUtils
            });

            const attributes = await repo.getAttributesUsingProfile({id: 'my_profile', ctx: mockCtx});

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/FILTER/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
            expect(attributes).toEqual([mockAttrAdvVersionable]);
        });
    });
});
