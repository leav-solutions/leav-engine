// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// import {appRootPath} from '@leav/app-root-path';
// import fs from 'fs';
// import {getConfig} from '../../../../config';
// import {IImportDomain} from '../../../../domain/import/importDomain';
// import {AttributeTypes} from '../../../../_types/attribute';
// import {IQueryInfos} from '../../../../_types/queryInfos';
// import {gqlSaveAttribute, gqlSaveLibrary, makeGraphQlCall} from '../e2eUtils';
// import {init} from '../globalSetup';
// import {setTimeout} from 'timers/promises';

// const testLibName = 'test_import';
// const testLibNameQuery = 'testImport';

// const ctx: IQueryInfos = {
//     userId: '1',
//     queryId: 'importDomainTest'
// };

// describe('Import', () => {
//     beforeAll(async () => {
//         await gqlSaveAttribute({
//             id: 'simple',
//             type: AttributeTypes.SIMPLE,
//             label: 'simple'
//         });

//         await gqlSaveAttribute({
//             id: 'simple_link',
//             type: AttributeTypes.SIMPLE_LINK,
//             label: 'simple_link',
//             linkedLibrary: testLibName
//         });

//         await gqlSaveAttribute({
//             id: 'advanced_link',
//             type: AttributeTypes.ADVANCED_LINK,
//             label: 'advanced_link',
//             linkedLibrary: 'users',
//             metadataFields: ['simple']
//         });

//         await gqlSaveLibrary(testLibName, testLibName);
//         await gqlSaveLibrary(testLibName, testLibName, ['simple', 'simple_link', 'advanced_link']);
//         await gqlSaveLibrary('users_groups', 'users_groups', ['simple']);

//         // Init AMQP
//         const conf = await getConfig();
//         const {coreContainer} = await init(conf);
//         const importDomain: IImportDomain = coreContainer.cradle['core.domain.import'];

//         const filename = 'import.test.json';

//         const file = await fs.promises.readFile(appRootPath() + '/src/__tests__/e2e/api/import/import.test.json'); // test file

//         await fs.promises.writeFile(`${conf.import.directory}/${filename}`, file.toString());

//         try {
//             await importDomain.import(filename, ctx);
//         } finally {
//             await fs.promises.unlink(`${conf.import.directory}/${filename}`);
//         }
//     });

//     test('check record creation: simple, simple_link and advanced_link', async () => {
//         expect.assertions(7);

//         await setTimeout(45000);

//         const res = await makeGraphQlCall(`{
//             ${testLibNameQuery} {
//                 totalCount
//                 list {
//                     simple
//                     simple_link { simple }
//                     advanced_link {login}
//                     property(attribute: "advanced_link") {
//                         metadata {
//                             name
//                             value {
//                                 value
//                             }
//                         }
//                     }
//                 }
//             }
//         }`);

//         expect(res.data.errors).toBeUndefined();
//         expect(res.status).toBe(200);
//         expect(res.data.data[testLibNameQuery].list.length).toBe(1);

//         const record = res.data.data[testLibNameQuery].list[0];

//         expect(record.simple).toBe('simple');
//         expect(record.simple_link.simple).toBe('simple');
//         expect(record.advanced_link.login).toBe('admin');
//         expect(record.property[0].metadata).toEqual([
//             {
//                 name: 'simple',
//                 value: {
//                     value: 'meta_value'
//                 }
//             }
//         ]);
//     });

//     test('check tree', async () => {
//         expect.assertions(5);

//         const usersGroups = await makeGraphQlCall('{ usersGroups { totalCount list { id simple } } }');

//         expect(usersGroups.data.errors).toBeUndefined();
//         expect(usersGroups.status).toBe(200);

//         const group = usersGroups.data.data.usersGroups.list.find(g => g.simple === 'test');
//         const res = await makeGraphQlCall('{ treeContent(treeId: "users_groups") { record { id } } }');

//         expect(res.data.errors).toBeUndefined();
//         expect(res.status).toBe(200);
//         expect(res.data.data.treeContent).toEqual(
//             expect.arrayContaining([
//                 expect.objectContaining({
//                     record: {
//                         id: group.id
//                     }
//                 })
//             ])
//         );
//     });
// });
