// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {IDbService} from 'infra/db/dbService';
import {mockCtx} from '../../__tests__/mocks/shared';
import valueRepo from './valueRepo';

describe('valueRepo', () => {
    describe('deleteAllValuesByRecord', () => {
        test('Delete all values linked to record', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        _key: '222612340',
                        _id: 'core_edge_values_links/222612340',
                        _from: 'ubs/222536515',
                        _to: 'core_values/222612335',
                        _rev: '_Wf3oPWC--_',
                        attribute: 'label',
                        modified_at: 1521047926,
                        created_at: 1521047926
                    },
                    {
                        _key: '223188816',
                        _id: 'core_edge_values_links/223188816',
                        _from: 'products/222763208',
                        _to: 'ubs/222536515',
                        _rev: '_WlGSULm--_',
                        attribute: 'linkedUb',
                        modified_at: 1522936384,
                        created_at: 1522936384
                    }
                ])
            };

            const repo = valueRepo({
                'core.infra.db.dbService': mockDbServ as IDbService
            });

            await repo.deleteAllValuesByRecord({
                libraryId: 'products',
                recordId: '222763208',
                ctx: mockCtx
            });

            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
        });
    });
});
