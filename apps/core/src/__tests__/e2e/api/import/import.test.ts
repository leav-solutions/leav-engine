// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {makeGraphQlCall, gqlSaveLibrary, gqlSaveAttribute} from '../e2eUtils';
import {AttributeTypes} from '../../../../_types/attribute';
import fs from 'fs';
import path from 'path';
import appRoot from 'app-root-path';
import {IFile} from '../../../../_types/import';
import {IImportDomain} from '../../../../domain/import/importDomain';
import {IQueryInfos} from '../../../../_types/queryInfos';
import {getConfig} from '../../../../config';
import {init} from '../globalSetup';

const testLibName = 'test_import';
const testLibNameQuery = 'testImport';

const ctx: IQueryInfos = {
    userId: '1',
    queryId: 'importDomainTest'
};

describe('Import', () => {
    test('tmp', () => {
        expect(true).toBe(true);
    });

    beforeAll(async () => {
        await gqlSaveAttribute({
            id: 'simple',
            type: AttributeTypes.SIMPLE,
            label: 'simple'
        });

        await gqlSaveAttribute({
            id: 'simple_link',
            type: AttributeTypes.SIMPLE_LINK,
            label: 'simple_link',
            linkedLibrary: testLibName
        });

        await gqlSaveAttribute({
            id: 'advanced_link',
            type: AttributeTypes.ADVANCED_LINK,
            label: 'advanced_link',
            linkedLibrary: 'users',
            metadataFields: ['simple']
        });

        await gqlSaveLibrary(testLibName, testLibName);
        await gqlSaveLibrary(testLibName, testLibName, ['simple', 'simple_link', 'advanced_link']);
        await gqlSaveLibrary('users_groups', 'users_groups', ['simple']);

        // Init AMQP
        const conf = await getConfig();
        const {coreContainer} = await init(conf);
        const importDomain: IImportDomain = coreContainer.cradle['core.domain.import'];

        const filename = 'import.test.json';

        const file = await fs.promises.readFile(
            path.resolve(appRoot + '/src/__tests__/e2e/api/import/import.test.json')
        ); // test file

        await fs.promises.writeFile(`/imports/${filename}`, file.toString());

        try {
            await importDomain.import(filename, ctx);
        } finally {
            await fs.promises.unlink(`/imports/${filename}`);
        }
    });

    test('check record creation: simple, simple_link and advanced_link', async () => {
        expect.assertions(7);

        const res = await makeGraphQlCall(
            `{ ${testLibNameQuery} { totalCount list { simple simple_link { simple } advanced_link {login} property(attribute: "advanced_link") { metadata } } } }`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameQuery].list.length).toBe(2);

        const record = res.data.data[testLibNameQuery].list[0];

        expect(record.simple).toBe('simple');
        expect(record.simple_link.simple).toBe('solo');
        expect(record.advanced_link.login).toBe('admin');
        expect(record.property[0].metadata).toEqual(
            expect.objectContaining({
                simple: 'meta_value'
            })
        );
    });

    test('check tree', async () => {
        expect.assertions(5);

        const usersGroups = await makeGraphQlCall('{ usersGroups { totalCount list { id simple } } }');

        expect(usersGroups.data.errors).toBeUndefined();
        expect(usersGroups.status).toBe(200);

        const group = usersGroups.data.data.usersGroups.list.find(g => g.simple === 'test');
        const res = await makeGraphQlCall('{ treeContent(treeId: "users_groups") { record { id } } }');

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data.treeContent).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    record: {
                        id: group.id
                    }
                })
            ])
        );
    });
});
