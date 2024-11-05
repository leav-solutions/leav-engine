// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {IDbService} from 'infra/db/dbService';
import {mockGlobalSettings} from '../../__tests__/mocks/globalSettings';
import {mockCtx} from '../../__tests__/mocks/shared';
import globalSettingsRepo from './globalSettingsRepo';

describe('getSettingsRepo', () => {
    describe('saveSettings', () => {
        const mockDbServ = {
            db: new Database(),
            execute: global.__mockPromise([mockGlobalSettings])
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('Should save settings', async () => {
            const repo = globalSettingsRepo({
                'core.infra.db.dbService': mockDbServ as IDbService
            });

            const savedSettings = await repo.saveSettings({settings: mockGlobalSettings, ctx: mockCtx});

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^UPSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(savedSettings).toMatchObject(mockGlobalSettings);
        });

        test('Should return settings', async () => {
            const repo = globalSettingsRepo({
                'core.infra.db.dbService': mockDbServ as IDbService
            });

            const savedSettings = await repo.getSettings(mockCtx);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(savedSettings).toMatchObject(mockGlobalSettings);
        });
    });
});
