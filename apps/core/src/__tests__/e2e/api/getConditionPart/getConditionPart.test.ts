// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {AttributeCondition} from '../../../../_types/record';
import {adminUserSdk, gqlCreateRecord, gqlSaveAttribute, makeGraphQlCall} from '../e2eUtils';

describe('GetConditionPart', () => {
    const testLibName = 'get_condition_part_test_lib';
    const testSimpleAttrId = 'get_condition_part_test_attr_simple';

    let record1: string;
    let record2: string;
    let record3: string;

    beforeAll(async () => {
        // Create library
        await adminUserSdk.SaveLibrary({library: {id: testLibName, label: {en: 'Test'}}});

        // Create attribute
        await gqlSaveAttribute({
            id: testSimpleAttrId,
            type: AttributeTypes.SIMPLE,
            label: 'test',
            format: AttributeFormats.TEXT,
        });

        // Save attribute on library
        await adminUserSdk.SaveLibrary({
            library: {id: testLibName, label: {en: 'Test'}, attributes: [testSimpleAttrId]},
        });

        // Create records
        record1 = await gqlCreateRecord(testLibName);
        record2 = await gqlCreateRecord(testLibName);
        record3 = await gqlCreateRecord(testLibName);

        // Save values on records with different case variations
        await makeGraphQlCall(`mutation {
            v1: saveValue(
                library: "${testLibName}",
                recordId: "${record1}",
                attribute: "${testSimpleAttrId}",
                value: {payload: "MixedCase"}) { id_value }
            v2: saveValue(
                library: "${testLibName}",
                recordId: "${record2}",
                attribute: "${testSimpleAttrId}",
                value: {payload: "UPPERCASE"}) { id_value }
            v3: saveValue(
                library: "${testLibName}",
                recordId: "${record3}",
                attribute: "${testSimpleAttrId}",
                value: {payload: "lowercase"}) { id_value }
        }`);
    });

    describe('Case insensitive filtering', () => {
        test('Filter with exact case match', async () => {
            const res = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}",
                    filters: [{field: "${testSimpleAttrId}", condition: ${AttributeCondition.EQUAL}, value: "MixedCase"}]
                ) { list {id} }
            }`);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.records.list.length).toBe(1);
            expect(res.data.data.records.list[0].id).toBe(record1);
        });

        test('Filter with lowercase when value is MixedCase', async () => {
            const res = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}",
                    filters: [{field: "${testSimpleAttrId}", condition: ${AttributeCondition.EQUAL}, value: "mixedcase"}]
                ) { list {id} }
            }`);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.records.list.length).toBe(1);
            expect(res.data.data.records.list[0].id).toBe(record1);
        });

        test('Filter with uppercase when value is MixedCase', async () => {
            const res = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}",
                    filters: [{field: "${testSimpleAttrId}", condition: ${AttributeCondition.EQUAL}, value: "MIXEDCASE"}]
                ) { list {id} }
            }`);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.records.list.length).toBe(1);
            expect(res.data.data.records.list[0].id).toBe(record1);
        });

        test('Filter with mixed case when value is UPPERCASE', async () => {
            const res = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}",
                    filters: [{field: "${testSimpleAttrId}", condition: ${AttributeCondition.EQUAL}, value: "UpPerCaSe"}]
                ) { list {id} }
            }`);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.records.list.length).toBe(1);
            expect(res.data.data.records.list[0].id).toBe(record2);
        });

        test('Filter with uppercase when value is lowercase', async () => {
            const res = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}",
                    filters: [{field: "${testSimpleAttrId}", condition: ${AttributeCondition.EQUAL}, value: "LOWERCASE"}]
                ) { list {id} }
            }`);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.records.list.length).toBe(1);
            expect(res.data.data.records.list[0].id).toBe(record3);
        });
    });

    describe('Case insensitive filtering with other conditions', () => {
        test('BEGIN_WITH condition with different case', async () => {
            const res = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}",
                    filters: [{field: "${testSimpleAttrId}", condition: ${AttributeCondition.BEGIN_WITH}, value: "mix"}]
                ) { list {id} }
            }`);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.records.list.length).toBe(1);
            expect(res.data.data.records.list[0].id).toBe(record1);
        });

        test('END_WITH condition with different case', async () => {
            const res = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}",
                    filters: [{field: "${testSimpleAttrId}", condition: ${AttributeCondition.END_WITH}, value: "CASE"}]
                ) { list {id} }
            }`);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.records.list.length).toBe(3);
        });

        test('CONTAINS condition with different case', async () => {
            const res = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}",
                    filters: [{field: "${testSimpleAttrId}", condition: ${AttributeCondition.CONTAINS}, value: "CAS"}]
                ) { list {id} }
            }`);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.records.list.length).toBe(3);
        });

        test('NOT_CONTAINS condition with different case', async () => {
            const res = await makeGraphQlCall(`{
                records(
                    library: "${testLibName}",
                    filters: [{field: "${testSimpleAttrId}", condition: ${AttributeCondition.NOT_CONTAINS}, value: "XYZ"}]
                ) { list {id} }
            }`);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data.records.list.length).toBe(3);
        });
    });
});
