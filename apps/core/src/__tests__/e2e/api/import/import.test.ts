// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Client as GraphqlWsClient} from 'graphql-ws';

import {appRootPath} from '@leav/app-root-path';
import path from 'path';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {
    gqlSaveAttribute,
    gqlSaveLibrary,
    importFileGraphQlCall,
    makeGraphQlCall,
    makeWebSocketGraphQlCall,
} from '../e2eUtils';
import {ImportMode, ImportType} from '../../../../_types/import';
import {TaskStatus} from '../../../../_types/tasksManager';
import {waitForTaskCompletion} from '../taskUtils';

const uuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const testLibName = 'test_import';
const labelAttributeId = 'create_record_test_label';
const lovAttributeId = 'create_record_test_lov';
const linkAttributeId = 'create_record_test_link';
const linkLibName = 'test_import_link';
const linkLabelAttributeId = 'create_record_test_link_label';

describe('Import', () => {
    let graphqlClient: GraphqlWsClient;

    beforeAll(async () => {
        graphqlClient = await makeWebSocketGraphQlCall();

        // Create attributes for main library
        await gqlSaveAttribute({
            id: labelAttributeId,
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT,
            label: labelAttributeId,
        });
        await gqlSaveAttribute({
            id: lovAttributeId,
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT,
            label: lovAttributeId,
        });
        await gqlSaveAttribute({
            id: linkAttributeId,
            type: AttributeTypes.SIMPLE_LINK,
            linkedLibrary: linkLibName,
            format: AttributeFormats.TEXT,
            label: linkAttributeId,
        });
        await gqlSaveLibrary(testLibName, testLibName, [labelAttributeId, lovAttributeId, linkAttributeId]);

        // Create attributes for link library
        await gqlSaveAttribute({
            id: linkLabelAttributeId,
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT,
            label: 'link_test1',
        });
        await gqlSaveLibrary(linkLibName, linkLibName, [linkLabelAttributeId]);
    });
    afterEach(async () => {
        // Purge all records in the test library using purgeRecord
        const recordsRes = await makeGraphQlCall(`{
                    records(library: "${testLibName}", retrieveInactive: true) {
                        list { id }
                    }
                }`);

        const recordsIds = recordsRes.data.data.records.list.map((r: {id: string}) => `"${r.id}"`);
        await makeGraphQlCall(
            `mutation { deactivateRecords( libraryId: "${testLibName}", recordsIds: [${recordsIds}]) { id } }`,
        );
        await makeGraphQlCall(`mutation { purgeInactiveRecords(libraryId: "${testLibName}") { id } }`);
    });

    afterAll(async () => {
        // Clean up records in both libraries
        for (const lib of [testLibName, linkLibName]) {
            const recordsRes = await makeGraphQlCall(`{
                        records(library: "${lib}", retrieveInactive: true) {
                            list { id }
                        }
                    }`);
            await Promise.all(
                recordsRes.data.data.records.list.map(async (r: {id: string}) => {
                    await makeGraphQlCall(
                        `mutation { deactivateRecords( libraryId: "${lib}", recordsIds: ["${r.id}"]) { id } }`,
                    );
                    await makeGraphQlCall(`mutation { purgeRecord(libraryId: "${lib}", recordId: "${r.id}") { id } }`);
                }),
            );
            await gqlSaveLibrary(lib, lib, []);
        }

        // Delete attributes for both libraries
        await makeGraphQlCall(`mutation { deleteAttribute(id: "${labelAttributeId}") { id } }`);
        await makeGraphQlCall(`mutation { deleteAttribute(id: "${lovAttributeId}") { id } }`);
        await makeGraphQlCall(`mutation { deleteAttribute(id: "${linkAttributeId}") { id } }`);
        await makeGraphQlCall(`mutation { deleteAttribute(id: "${linkLabelAttributeId}") { id } }`);

        // Delete both libraries
        await makeGraphQlCall(`mutation { deleteLibrary(id: "${testLibName}") { id } }`);
        await makeGraphQlCall(`mutation { deleteLibrary(id: "${linkLibName}") { id } }`);
        graphqlClient.dispose();
    });

    describe('Import Data', () => {
        it('should throw an error if importData mutation is called with invalid arguments', async () => {
            const query = `mutation importData($file: Upload!) {
                importExcel(file: null)
            }`;

            await expect(makeGraphQlCall(query, {skipLogErrors: true})).rejects.toThrow(
                /Request failed with status code 400/,
            );
        });
        it('should import import.test.json and verify DB state', async () => {
            const importFilePath = path.join(appRootPath(), '/src/__tests__/e2e/api/import/datas/import.test.json');

            const importResult = await importFileGraphQlCall(
                `mutation importData($file: Upload!) {
                        importData(file: $file)
                    }`,
                importFilePath,
            );

            expect(importResult.data.importData).toMatch(uuidRegExp);

            const task = await waitForTaskCompletion(importResult.data.importData);

            expect(task.status).toEqual(TaskStatus.DONE);

            const res = await makeGraphQlCall(`{
                    records(
                        library: "${testLibName}"
                    ) {
                        list {
                            id
                        }
                    }
                }`);

            expect(res.data.data.records.list.length).toBe(3);
        });
    });

    describe('Import Excel', () => {
        describe('Standard', () => {
            it('should import datasToImport.xlsx in insert only mode and verify DB state', async () => {
                const query = `mutation importExcel($file: Upload!, $sheets: [SheetInput!]!) {
                        importExcel(file: $file, sheets: $sheets)
                    }`;
                const importFilePath = path.join(
                    appRootPath(),
                    '/src/__tests__/e2e/api/import/datas/datasToImport.xlsx',
                );
                const sheets = [
                    {
                        type: ImportType.STANDARD,
                        library: testLibName,
                        mode: ImportMode.INSERT,
                        mapping: [labelAttributeId, lovAttributeId],
                    },
                ];

                const importResult = await importFileGraphQlCall(query, importFilePath, sheets);

                expect(importResult.data.importExcel).toMatch(uuidRegExp);

                const task = await waitForTaskCompletion(importResult.data.importExcel);

                expect(task.status).toEqual(TaskStatus.DONE);

                const res = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}"
                ) {
                    list {
                        id
                        properties(attributeIds: ["${labelAttributeId}", "${lovAttributeId}"]) {
                            attributeId
                            values {
                                ... on Value {
                                    raw_payload
                                }
                            }
                        }
                    }
                }
            }`);

                const props = res.data.data.records.list.map(r =>
                    r.properties.map(p => ({
                        attributeId: p.attributeId,
                        values: p.values.map(v => v.raw_payload),
                    })),
                );
                expect(props).toEqual(
                    expect.arrayContaining([
                        expect.arrayContaining([
                            {attributeId: labelAttributeId, values: ['Label 3']},
                            {attributeId: lovAttributeId, values: ['Value 3']},
                        ]),
                        expect.arrayContaining([
                            {attributeId: labelAttributeId, values: ['Label 2']},
                            {attributeId: lovAttributeId, values: ['Value 2']},
                        ]),
                        expect.arrayContaining([
                            {attributeId: labelAttributeId, values: ['Label 1']},
                            {attributeId: lovAttributeId, values: ['Value 1']},
                        ]),
                    ]),
                );
                expect(res.data.data.records.list.length).toBe(3);
            });

            it('should import datasToImportWithEmptyFields.xlsx in insert only mode and verify DB state', async () => {
                const query = `mutation importExcel($file: Upload!, $sheets: [SheetInput!]!) {
                        importExcel(file: $file, sheets: $sheets)
                    }`;
                const importFilePath = path.join(
                    appRootPath(),
                    '/src/__tests__/e2e/api/import/datas/datasToImportWithEmptyFields.xlsx',
                );
                const sheets = [
                    {
                        type: ImportType.STANDARD,
                        library: testLibName,
                        mode: ImportMode.UPSERT,
                        mapping: [labelAttributeId, lovAttributeId],
                    },
                ];

                const importResult = await importFileGraphQlCall(query, importFilePath, sheets);

                expect(importResult.data.importExcel).toMatch(uuidRegExp);

                const task = await waitForTaskCompletion(importResult.data.importExcel);

                expect(task.status).toEqual(TaskStatus.DONE);

                const res = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}"
                ) {
                    list {
                        id
                        properties(attributeIds: ["${labelAttributeId}", "${lovAttributeId}"]) {
                            attributeId
                            values {
                                ... on Value {
                                    raw_payload
                                }
                            }
                        }
                    }
                }
            }`);

                const props = res.data.data.records.list.map(r =>
                    r.properties.map(p => ({
                        attributeId: p.attributeId,
                        values: p.values.map(v => v.raw_payload),
                    })),
                );
                expect(props).toEqual(
                    expect.arrayContaining([
                        expect.arrayContaining([
                            {attributeId: labelAttributeId, values: ['Label 3']},
                            {attributeId: lovAttributeId, values: []},
                        ]),
                        expect.arrayContaining([
                            {attributeId: labelAttributeId, values: ['Label 2']},
                            {attributeId: lovAttributeId, values: []},
                        ]),
                        expect.arrayContaining([
                            {attributeId: labelAttributeId, values: ['Label 1']},
                            {attributeId: lovAttributeId, values: ['Value 1']},
                        ]),
                    ]),
                );
                expect(res.data.data.records.list.length).toBe(3);
            });

            it('should import datasToImport.xlsx in update only mode and not create new records', async () => {
                const query = `mutation importExcel($file: Upload!, $sheets: [SheetInput!]!) {
                        importExcel(file: $file, sheets: $sheets)
                    }`;
                const importFilePath = path.join(
                    appRootPath(),
                    '/src/__tests__/e2e/api/import/datas/datasToImport.xlsx',
                );
                const sheets = [
                    {
                        type: ImportType.STANDARD,
                        library: testLibName,
                        mode: ImportMode.UPDATE,
                        mapping: [labelAttributeId, lovAttributeId],
                        keyIndex: 0,
                    },
                ];

                // No records exist yet, so update should not create any
                const importResult = await importFileGraphQlCall(query, importFilePath, sheets);
                expect(importResult.data.importExcel).toMatch(uuidRegExp);

                const task = await waitForTaskCompletion(importResult.data.importExcel);

                expect(task.status).toEqual(TaskStatus.DONE);

                const res = await makeGraphQlCall(`{
                    records(
                        library: "${testLibName}"
                    ) {
                        list {
                            id
                            properties(attributeIds: ["${labelAttributeId}", "${lovAttributeId}"]) {
                                attributeId
                                values {
                                    ... on Value {
                                        raw_payload
                                    }
                                }
                            }
                        }
                    }
                }`);

                expect(res.data.data.records.list.length).toBe(0);
            });
        });

        describe('Link', () => {
            it('should import and should add a link from library 1 to library 2', async () => {
                const query = `mutation importExcel($file: Upload!, $sheets: [SheetInput!]!) {
                        importExcel(file: $file, sheets: $sheets)
                    }`;
                const importFilePath = path.join(
                    appRootPath(),
                    '/src/__tests__/e2e/api/import/datas/datasToImport.xlsx',
                );

                const sheets1 = [
                    {
                        type: ImportType.STANDARD,
                        library: testLibName,
                        mode: ImportMode.INSERT,
                        mapping: [labelAttributeId],
                    },
                ];
                const importResult1 = await importFileGraphQlCall(query, importFilePath, sheets1);
                expect(importResult1.data.importExcel).toMatch(uuidRegExp);

                const task1 = await waitForTaskCompletion(importResult1.data.importExcel);

                expect(task1.status).toEqual(TaskStatus.DONE);

                const sheets2 = [{...sheets1[0], library: linkLibName, mapping: [null, linkLabelAttributeId]}];
                const importResult2 = await importFileGraphQlCall(query, importFilePath, sheets2);
                expect(importResult2.data.importExcel).toMatch(uuidRegExp);

                const task2 = await waitForTaskCompletion(importResult2.data.importExcel);

                expect(task2.status).toEqual(TaskStatus.DONE);

                const sheetsLink = [
                    {
                        type: ImportType.LINK,
                        library: testLibName,
                        mode: ImportMode.UPSERT,
                        mapping: [labelAttributeId, linkLabelAttributeId],
                        keyIndex: 0,
                        linkAttribute: linkAttributeId,
                        keyToIndex: 1,
                    },
                ];
                const importResultLink = await importFileGraphQlCall(query, importFilePath, sheetsLink);
                expect(importResultLink.data.importExcel).toMatch(uuidRegExp);

                const taskLink = await waitForTaskCompletion(importResultLink.data.importExcel);

                expect(taskLink.status).toEqual(TaskStatus.DONE);

                // Check records in main library
                const res = await makeGraphQlCall(`{
                    records(
                        library: "${testLibName}"
                    ) {
                        list {
                            id
                            properties(attributeIds: ["${labelAttributeId}", "${linkAttributeId}"]) {
                                attributeId
                                values {
                                    ... on Value {
                                        raw_payload
                                    }
                                    ... on LinkValue {
                                        payload {
                                            id
                                        }
                                    }
                                }
                            }
                        }
                    }
                }`);

                const labelValues = res.data.data.records.list.flatMap((r: any) =>
                    r.properties
                        .filter((p: any) => p.attributeId === labelAttributeId)
                        .flatMap((p: any) => p.values.map((v: any) => v.raw_payload)),
                );
                const lovValues = res.data.data.records.list.flatMap((r: any) =>
                    r.properties
                        .filter((p: any) => p.attributeId === linkAttributeId)
                        .flatMap((p: any) => p.values.map((v: any) => v.payload?.id)),
                );

                expect(labelValues.length).toBe(3);
                expect(lovValues.length).toBe(3);

                // Check records in link library
                const linkRes = await makeGraphQlCall(`{
                    records(
                        library: "${linkLibName}"
                    ) {
                        list {
                            id
                            properties(attributeIds: ["${linkLabelAttributeId}"]) {
                                attributeId
                                values {
                                    ... on Value {
                                        raw_payload
                                    }
                                }
                            }
                        }
                    }
                }`);

                expect(linkRes.data.data.records.list.length).toBe(3);
            });
        });
    });
});
