// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import moment from 'moment';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {AttributeCondition} from '../../../../_types/record';
import {
    gqlAddElemToTree,
    gqlCreateRecord,
    gqlSaveAttribute,
    gqlSaveLibrary,
    gqlSaveTree,
    gqlSaveValue,
    makeGraphQlCall,
    toCleanJSON
} from '../e2eUtils';

/**
 * This file focuses on testing all search filters possible on every attributes type or format
 */
describe('searchFilters', () => {
    let recordId1;
    let recordId2;
    let recordId3;

    let recordIdForOperators1;
    let recordIdForOperators2;
    let recordIdForOperators3;

    let recordDateId1;
    let recordDateId2;
    let recordDateId3;
    let recordDateIdYesterday;
    let recordDateIdTomorrow;
    let recordDateIdNextMonth;
    let recordDateIdLastMonth;

    let linkedRecordId1;
    let linkedRecordId2;
    let linkedRecordId3;

    let treeRecordId1;
    let treeRecordId2;
    let treeRecordId3;

    const libraryId = 'search_filters_library_id';
    const libraryGqlQuery = 'searchFiltersLibraryId';

    const libraryForOperatorsId = 'search_filters_library_for_operators_id';
    const libraryForOperatorsGqlQuery = 'searchFiltersLibraryForOperatorsId';

    const linkedLibraryId = 'search_filters_linked_library_id';

    const treeId = 'search_filters_tree_id';
    const treeLibraryId = 'search_filters_tree_library_id';

    // Used for date filters
    const libraryDateId = 'search_filters_date_library_id';
    const libraryDateGqlQuery = 'searchFiltersDateLibraryId';

    const textAttributeId = 'search_filter_text_attribute_id';
    const simpleAttributeId = 'search_filter_simple_attribute_id';
    const textAdvancedAttributeId = 'search_filter_text_advanced_attribute_id';
    const textAdvancedMultivalAttributeId = 'search_filter_text_advanced_multival_attribute_id';
    const numberAttributeId = 'search_filter_number_attribute_id';
    const dateAttributeId = 'search_filter_date_attribute_id';
    const booleanAttributeId = 'search_filter_boolean_attribute_id';
    const embeddedAttributeId = 'search_filter_embedded_attribute_id';
    const simpleLinkAttributeId = 'search_filter_simple_link_attribute_id';
    const advancedLinkAttributeId = 'search_filter_advanced_link_attribute_id';
    const advancedLinkMultivalAttributeId = 'search_filter_advanced_link_multival_attribute_id';
    const treeAttributeId = 'search_filter_tree_attribute_id';
    const treeMultivalAttributeId = 'search_filter_tree_multival_attribute_id';
    const dateRangeAttributeId = 'search_filter_date_range_attribute_id';

    beforeAll(async () => {
        const attributesToCreate = [
            {id: textAttributeId, label: 'textAttributeId', type: AttributeTypes.SIMPLE, format: AttributeFormats.TEXT},
            {
                id: simpleAttributeId,
                label: 'simpleAttributeId',
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT
            },
            {
                id: textAdvancedAttributeId,
                label: 'textAdvancedAttributeId',
                type: AttributeTypes.ADVANCED,
                format: AttributeFormats.TEXT
            },
            {
                id: textAdvancedMultivalAttributeId,
                label: 'textAdvancedMultivalAttributeId',
                type: AttributeTypes.ADVANCED,
                format: AttributeFormats.TEXT,
                multipleValues: true
            },
            {
                id: numberAttributeId,
                label: 'numberAttributeId',
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.NUMERIC
            },
            {id: dateAttributeId, label: 'dateAttributeId', type: AttributeTypes.SIMPLE, format: AttributeFormats.DATE},
            {
                id: booleanAttributeId,
                label: 'booleanAttributeId',
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.BOOLEAN
            },
            {
                id: embeddedAttributeId,
                label: 'embeddedAttributeId',
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.EXTENDED,
                embbededFields: [
                    {
                        id: 'field1',
                        format: AttributeFormats.TEXT,
                        embedded_fields: [
                            {
                                id: 'field11',
                                format: AttributeFormats.TEXT,
                                embedded_fields: []
                            }
                        ]
                    }
                ]
            },
            {
                id: simpleLinkAttributeId,
                type: AttributeTypes.SIMPLE_LINK,
                label: 'linkAttributeId',
                linkedLibrary: linkedLibraryId
            },
            {
                id: advancedLinkAttributeId,
                type: AttributeTypes.ADVANCED_LINK,
                label: 'advancedLinkAttributeId',
                linkedLibrary: linkedLibraryId
            },
            {
                id: advancedLinkMultivalAttributeId,
                type: AttributeTypes.ADVANCED_LINK,
                label: 'advancedLinkMultivalAttributeId',
                linkedLibrary: linkedLibraryId,
                multipleValues: true
            },
            {
                id: treeAttributeId,
                type: AttributeTypes.TREE,
                label: 'treeAttributeId',
                linkedTree: treeId
            },
            {
                id: treeMultivalAttributeId,
                type: AttributeTypes.TREE,
                label: 'treeMultivalAttributeId',
                linkedTree: treeId,
                multipleValues: true
            },
            {
                id: dateRangeAttributeId,
                label: 'dateRangeAttributeId',
                format: AttributeFormats.DATE_RANGE,
                type: AttributeTypes.SIMPLE
            }
        ];

        // Create library with no attributes first so that the graphql is available
        await gqlSaveLibrary(linkedLibraryId, 'Test lib');

        for (const attribute of attributesToCreate) {
            await gqlSaveAttribute(attribute);
        }

        await gqlSaveLibrary(
            treeLibraryId,
            'Test lib',
            attributesToCreate.map(a => a.id).filter(id => id !== treeAttributeId)
        );
        await gqlSaveTree(treeId, 'Tree', [treeLibraryId]);

        await gqlSaveLibrary(
            linkedLibraryId,
            'Test lib',
            attributesToCreate
                .map(a => a.id)
                .filter(id => ![simpleLinkAttributeId, advancedLinkAttributeId].includes(id))
        );

        await gqlSaveLibrary(
            libraryId,
            'Test lib',
            attributesToCreate.map(a => a.id)
        );

        await gqlSaveLibrary(
            libraryForOperatorsId,
            'Test lib',
            attributesToCreate.map(a => a.id)
        );

        await gqlSaveLibrary(libraryDateId, 'Test lib', [dateAttributeId]);

        recordId1 = await gqlCreateRecord(libraryId);
        recordId2 = await gqlCreateRecord(libraryId);
        recordId3 = await gqlCreateRecord(libraryId);

        recordIdForOperators1 = await gqlCreateRecord(libraryForOperatorsId);
        recordIdForOperators2 = await gqlCreateRecord(libraryForOperatorsId);
        recordIdForOperators3 = await gqlCreateRecord(libraryForOperatorsId);

        linkedRecordId1 = await gqlCreateRecord(linkedLibraryId);
        linkedRecordId2 = await gqlCreateRecord(linkedLibraryId);
        linkedRecordId3 = await gqlCreateRecord(linkedLibraryId);

        treeRecordId1 = await gqlCreateRecord(treeLibraryId);
        treeRecordId2 = await gqlCreateRecord(treeLibraryId);
        treeRecordId3 = await gqlCreateRecord(treeLibraryId);

        recordDateId1 = await gqlCreateRecord(libraryDateId);
        recordDateId2 = await gqlCreateRecord(libraryDateId);
        recordDateId3 = await gqlCreateRecord(libraryDateId);

        recordDateIdYesterday = await gqlCreateRecord(libraryDateId);
        recordDateIdTomorrow = await gqlCreateRecord(libraryDateId);
        recordDateIdNextMonth = await gqlCreateRecord(libraryDateId);
        recordDateIdLastMonth = await gqlCreateRecord(libraryDateId);
    });

    describe('Filters conditions', () => {
        describe('Text format', () => {
            beforeAll(async () => {
                await gqlSaveValue(textAttributeId, libraryId, recordId1, 'my_value');
                await gqlSaveValue(textAttributeId, libraryId, recordId2, 'other_value');

                await gqlSaveValue(textAdvancedAttributeId, libraryId, recordId1, 'my_value_advanced');
                await gqlSaveValue(textAdvancedAttributeId, libraryId, recordId2, 'other_value_advanced');
            });

            test('Equal', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${textAttributeId}",
                            condition: ${AttributeCondition.EQUAL},
                            value: "my_value"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });

            test('Not Equal', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${textAttributeId}",
                            condition: ${AttributeCondition.NOT_EQUAL},
                            value: "my_value"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(2);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId3);
                expect(res.data.data[libraryGqlQuery].list[1].id).toBe(recordId2);
            });

            test('Contains', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${textAttributeId}",
                            condition: ${AttributeCondition.CONTAINS},
                            value: "value"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(2);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId2);
                expect(res.data.data[libraryGqlQuery].list[1].id).toBe(recordId1);
            });

            test('Do not contains', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${textAttributeId}",
                            condition: ${AttributeCondition.NOT_CONTAINS},
                            value: "other_"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(2);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId3);
                expect(res.data.data[libraryGqlQuery].list[1].id).toBe(recordId1);
            });

            test('Start with', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${textAttributeId}",
                            condition: ${AttributeCondition.BEGIN_WITH},
                            value: "other_"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId2);
            });

            test('End with', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${textAttributeId}",
                            condition: ${AttributeCondition.END_WITH},
                            value: "lue"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(2);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId2);
                expect(res.data.data[libraryGqlQuery].list[1].id).toBe(recordId1);
            });

            test('Is empty', async () => {
                const res = await makeGraphQlCall(`{
                    onSimple: ${libraryGqlQuery}(
                        filters: [{
                            field: "${textAttributeId}",
                            condition: ${AttributeCondition.IS_EMPTY}
                        }]) {
                            list {id}
                        },
                    onAdvanced: ${libraryGqlQuery}(
                        filters: [{
                            field: "${textAdvancedAttributeId}",
                            condition: ${AttributeCondition.IS_EMPTY}
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);

                expect(res.data.data.onSimple.list.length).toBe(1);
                expect(res.data.data.onSimple.list[0].id).toBe(recordId3);

                expect(res.data.data.onAdvanced.list.length).toBe(1);
                expect(res.data.data.onAdvanced.list[0].id).toBe(recordId3);
            });

            test('Is not empty', async () => {
                const res = await makeGraphQlCall(`{
                    onSimple: ${libraryGqlQuery}(
                        filters: [{
                            field: "${textAttributeId}",
                            condition: ${AttributeCondition.IS_NOT_EMPTY}
                        }]) {
                            list {id}
                        },
                    onAdvanced: ${libraryGqlQuery}(
                        filters: [{
                            field: "${textAdvancedAttributeId}",
                            condition: ${AttributeCondition.IS_NOT_EMPTY}
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);

                expect(res.data.data.onSimple.list.length).toBe(2);
                expect(res.data.data.onSimple.list[0].id).toBe(recordId2);
                expect(res.data.data.onSimple.list[1].id).toBe(recordId1);

                expect(res.data.data.onAdvanced.list.length).toBe(2);
                expect(res.data.data.onAdvanced.list[0].id).toBe(recordId2);
                expect(res.data.data.onAdvanced.list[1].id).toBe(recordId1);
            });
        });

        describe('Number format', () => {
            beforeAll(async () => {
                await gqlSaveValue(numberAttributeId, libraryId, recordId1, '42');
                await gqlSaveValue(numberAttributeId, libraryId, recordId2, '7331');
                await gqlSaveValue(numberAttributeId, libraryId, recordId3, '1337');
            });

            test('Greater than', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${numberAttributeId}",
                            condition: ${AttributeCondition.GREATER_THAN},
                            value: "1000"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(2);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId3);
                expect(res.data.data[libraryGqlQuery].list[1].id).toBe(recordId2);
            });

            test('Lower than', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${numberAttributeId}",
                            condition: ${AttributeCondition.LESS_THAN},
                            value: "1000"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });
        });

        describe('Date format', () => {
            beforeAll(async () => {
                await gqlSaveValue(dateAttributeId, libraryDateId, recordDateId1, '550144800'); // 1987-06-08 12:00:00
                await gqlSaveValue(dateAttributeId, libraryDateId, recordDateId2, '550144900'); // 1987-06-08 12:01:40
                await gqlSaveValue(
                    dateAttributeId,
                    libraryDateId,
                    recordDateId3,
                    String(Math.floor(new Date().getTime() / 1000) - 60)
                ); // now - We remove 60 seconds to avoid issue with racing conditions on last/next month
                await gqlSaveValue(
                    dateAttributeId,
                    libraryDateId,
                    recordDateIdYesterday,
                    String(moment().subtract(1, 'days').unix()) // yesterday
                );
                await gqlSaveValue(
                    dateAttributeId,
                    libraryDateId,
                    recordDateIdTomorrow,
                    String(moment().add(1, 'days').unix()) // tomorrow
                );
                await gqlSaveValue(
                    dateAttributeId,
                    libraryDateId,
                    recordDateIdNextMonth,
                    String(moment().add(29, 'days').unix()) // next month (= next 31 days)
                );
                await gqlSaveValue(
                    dateAttributeId,
                    libraryDateId,
                    recordDateIdLastMonth,
                    String(moment().subtract(29, 'days').unix()) // last month (= last 31 days)
                );
            });

            test('Before', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryDateGqlQuery}(
                        filters: [{
                            field: "${dateAttributeId}",
                            condition: ${AttributeCondition.LESS_THAN},
                            value: "550144901"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryDateGqlQuery].list.length).toBe(2);
                expect(res.data.data[libraryDateGqlQuery].list[0].id).toBe(recordDateId2);
                expect(res.data.data[libraryDateGqlQuery].list[1].id).toBe(recordDateId1);
            });

            test('After', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryDateGqlQuery}(
                        filters: [{
                            field: "${dateAttributeId}",
                            condition: ${AttributeCondition.GREATER_THAN},
                            value: "550144850"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryDateGqlQuery].list.length).toBe(6);
                expect(res.data.data[libraryDateGqlQuery].list[0].id).toBe(recordDateIdLastMonth);
            });

            test('Equal (rounded at day)', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryDateGqlQuery}(
                        filters: [{
                            field: "${dateAttributeId}",
                            condition: ${AttributeCondition.EQUAL},
                            value: "550144850"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryDateGqlQuery].list.length).toBe(2);
                expect(res.data.data[libraryDateGqlQuery].list[0].id).toBe(recordDateId2);
                expect(res.data.data[libraryDateGqlQuery].list[1].id).toBe(recordDateId1);
            });

            test('Not equal (rounded at day)', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryDateGqlQuery}(
                        filters: [{
                            field: "${dateAttributeId}",
                            condition: ${AttributeCondition.NOT_EQUAL},
                            value: "550144850"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryDateGqlQuery].list.length).toBe(5);
            });

            test('Between', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryDateGqlQuery}(
                        filters: [{
                            field: "${dateAttributeId}",
                            condition: ${AttributeCondition.BETWEEN},
                            value: "${toCleanJSON({from: '550144750', to: '550144950'})}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryDateGqlQuery].list.length).toBe(2);
                expect(res.data.data[libraryDateGqlQuery].list[0].id).toBe(recordDateId2);
                expect(res.data.data[libraryDateGqlQuery].list[1].id).toBe(recordDateId1);
            });

            test('Today', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryDateGqlQuery}(
                        filters: [{
                            field: "${dateAttributeId}",
                            condition: ${AttributeCondition.TODAY}
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryDateGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryDateGqlQuery].list[0].id).toBe(recordDateId3);
            });

            test('Yesterday', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryDateGqlQuery}(
                        filters: [{
                            field: "${dateAttributeId}",
                            condition: ${AttributeCondition.YESTERDAY}
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryDateGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryDateGqlQuery].list[0].id).toBe(recordDateIdYesterday);
            });

            test('Tomorrow', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryDateGqlQuery}(
                        filters: [{
                            field: "${dateAttributeId}",
                            condition: ${AttributeCondition.TOMORROW}
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryDateGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryDateGqlQuery].list[0].id).toBe(recordDateIdTomorrow);
            });

            test('Next month', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryDateGqlQuery}(
                        filters: [{
                            field: "${dateAttributeId}",
                            condition: ${AttributeCondition.NEXT_MONTH}
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryDateGqlQuery].list.length).toBe(2);
            });

            test('Last month', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryDateGqlQuery}(
                        filters: [{
                            field: "${dateAttributeId}",
                            condition: ${AttributeCondition.LAST_MONTH}
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryDateGqlQuery].list.length).toBe(3);
            });
        });

        describe('Boolean format', () => {
            beforeAll(async () => {
                await gqlSaveValue(booleanAttributeId, libraryId, recordId1, 'true');
                await gqlSaveValue(booleanAttributeId, libraryId, recordId2, 'false');
                await gqlSaveValue(booleanAttributeId, libraryId, recordId3, 'true');
            });

            test('Is true/false', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${booleanAttributeId}",
                            condition: ${AttributeCondition.EQUAL},
                            value: "true"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(2);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId3);
                expect(res.data.data[libraryGqlQuery].list[1].id).toBe(recordId1);
            });
        });

        describe('Extended format', () => {
            beforeAll(async () => {
                await gqlSaveValue(
                    embeddedAttributeId,
                    libraryId,
                    recordId1,
                    toCleanJSON({field1: {field11: 'nested value'}})
                );
            });

            test('Contains', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${embeddedAttributeId}.field1.field11",
                            condition: ${AttributeCondition.CONTAINS},
                            value: "nested"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });
        });

        describe('Date range format', () => {
            beforeAll(async () => {
                await gqlSaveValue(
                    dateRangeAttributeId,
                    libraryId,
                    recordId1,
                    toCleanJSON({from: moment('1987-06-07 12:00:00').unix(), to: moment('1987-06-09 12:00:00').unix()})
                );

                await gqlSaveValue(
                    dateRangeAttributeId,
                    libraryId,
                    recordId2,
                    toCleanJSON({from: moment('2021-12-20 12:00:00').unix(), to: moment('2021-12-20 16:00:00').unix()})
                );

                await gqlSaveValue(
                    dateRangeAttributeId,
                    libraryId,
                    recordId3,
                    toCleanJSON({from: moment('2021-12-25 12:00:00').unix(), to: moment('2021-12-25 16:00:00').unix()})
                );
            });

            test('Contains', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${dateRangeAttributeId}",
                            condition: ${AttributeCondition.CONTAINS},
                            value: "${moment('1987-06-08 12:00:00').unix()}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });

            test('Start on (rounded  at day)', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${dateRangeAttributeId}",
                            condition: ${AttributeCondition.START_ON},
                            value: "${moment('1987-06-07 08:00:00').unix()}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });

            test('Start before', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${dateRangeAttributeId}",
                            condition: ${AttributeCondition.START_BEFORE},
                            value: "${moment('1987-06-10 08:00:00').unix()}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });

            test('Start after', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${dateRangeAttributeId}",
                            condition: ${AttributeCondition.START_AFTER},
                            value: "${moment('2021-12-19 08:00:00').unix()}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(2);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId3);
                expect(res.data.data[libraryGqlQuery].list[1].id).toBe(recordId2);
            });

            test('End on (rounded at day)', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${dateRangeAttributeId}",
                            condition: ${AttributeCondition.END_ON},
                            value: "${moment('1987-06-09 08:00:00').unix()}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });

            test('End before', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${dateRangeAttributeId}",
                            condition: ${AttributeCondition.END_BEFORE},
                            value: "${moment('1987-06-10 08:00:00').unix()}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });

            test('End after', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${dateRangeAttributeId}",
                            condition: ${AttributeCondition.END_AFTER},
                            value: "${moment('2021-12-21 08:00:00').unix()}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId3);
            });
        });

        describe('Values count on simple attribute', () => {
            beforeAll(async () => {
                await gqlSaveValue(simpleAttributeId, libraryId, recordId1, 'first value');
                await gqlSaveValue(simpleAttributeId, libraryId, recordId2, 'first value');
            });

            test('Equal', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${simpleAttributeId}",
                            condition: ${AttributeCondition.VALUES_COUNT_EQUAL},
                            value: "1"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(2);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId2);
                expect(res.data.data[libraryGqlQuery].list[1].id).toBe(recordId1);
            });

            test('Greater than', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${simpleAttributeId}",
                            condition: ${AttributeCondition.VALUES_COUNT_GREATER_THAN},
                            value: "1"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(0);
            });

            test('Lower than', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${simpleAttributeId}",
                            condition: ${AttributeCondition.VALUES_COUNT_LOWER_THAN},
                            value: "2"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(3);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId3);
                expect(res.data.data[libraryGqlQuery].list[1].id).toBe(recordId2);
                expect(res.data.data[libraryGqlQuery].list[2].id).toBe(recordId1);
            });
        });

        describe('Values count on advanced attribute', () => {
            beforeAll(async () => {
                await gqlSaveValue(textAdvancedMultivalAttributeId, libraryId, recordId1, 'first value');

                await gqlSaveValue(textAdvancedMultivalAttributeId, libraryId, recordId2, 'first value');
                await gqlSaveValue(textAdvancedMultivalAttributeId, libraryId, recordId2, 'second value');

                await gqlSaveValue(textAdvancedMultivalAttributeId, libraryId, recordId3, 'first value');
                await gqlSaveValue(textAdvancedMultivalAttributeId, libraryId, recordId3, 'second value');
                await gqlSaveValue(textAdvancedMultivalAttributeId, libraryId, recordId3, 'third value');
            });

            test('Equal', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${textAdvancedMultivalAttributeId}",
                            condition: ${AttributeCondition.VALUES_COUNT_EQUAL},
                            value: "2"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId2);
            });

            test('Greater than', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${textAdvancedMultivalAttributeId}",
                            condition: ${AttributeCondition.VALUES_COUNT_GREATER_THAN},
                            value: "2"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId3);
            });

            test('Lower than', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${textAdvancedMultivalAttributeId}",
                            condition: ${AttributeCondition.VALUES_COUNT_LOWER_THAN},
                            value: "2"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });
        });

        describe('Simple link attribute', () => {
            beforeAll(async () => {
                await gqlSaveValue(simpleLinkAttributeId, libraryId, recordId1, linkedRecordId1);
                await gqlSaveValue(simpleLinkAttributeId, libraryId, recordId2, linkedRecordId2);
            });

            test('Contains', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${simpleLinkAttributeId}",
                            condition: ${AttributeCondition.CONTAINS},
                            value: "${linkedRecordId1}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });

            test('Do not contains', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${simpleLinkAttributeId}",
                            condition: ${AttributeCondition.NOT_CONTAINS},
                            value: "${linkedRecordId1}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId2);
            });

            test('Start with', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${simpleLinkAttributeId}",
                            condition: ${AttributeCondition.BEGIN_WITH},
                            value: "${linkedRecordId1}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });

            test('End with', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${simpleLinkAttributeId}",
                            condition: ${AttributeCondition.END_WITH},
                            value: "${linkedRecordId1.slice(-4)}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });

            test('Is empty', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${simpleLinkAttributeId}",
                            condition: ${AttributeCondition.IS_EMPTY}
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId3);
            });

            test('Is not empty', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${simpleLinkAttributeId}",
                            condition: ${AttributeCondition.IS_NOT_EMPTY}
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(2);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId2);
                expect(res.data.data[libraryGqlQuery].list[1].id).toBe(recordId1);
            });

            describe('Values count', () => {
                test('Equal', async () => {
                    const res = await makeGraphQlCall(`{
                        ${libraryGqlQuery}(
                            filters: [{
                                field: "${simpleLinkAttributeId}",
                                condition: ${AttributeCondition.VALUES_COUNT_EQUAL},
                                value: "1"
                            }]) {
                                list {id}
                            }
                        }`);

                    expect(res.data.errors).toBeUndefined();
                    expect(res.status).toBe(200);
                    expect(res.data.data[libraryGqlQuery].list.length).toBe(2);
                    expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId2);
                    expect(res.data.data[libraryGqlQuery].list[1].id).toBe(recordId1);
                });

                test('Greater than', async () => {
                    const res = await makeGraphQlCall(`{
                        ${libraryGqlQuery}(
                            filters: [{
                                field: "${simpleLinkAttributeId}",
                                condition: ${AttributeCondition.VALUES_COUNT_GREATER_THAN},
                                value: "1"
                            }]) {
                                list {id}
                            }
                        }`);

                    expect(res.data.errors).toBeUndefined();
                    expect(res.status).toBe(200);
                    expect(res.data.data[libraryGqlQuery].list.length).toBe(0);
                });

                test('Lower than', async () => {
                    const res = await makeGraphQlCall(`{
                        ${libraryGqlQuery}(
                            filters: [{
                                field: "${simpleLinkAttributeId}",
                                condition: ${AttributeCondition.VALUES_COUNT_LOWER_THAN},
                                value: "2"
                            }]) {
                                list {id}
                            }
                        }`);

                    expect(res.data.errors).toBeUndefined();
                    expect(res.status).toBe(200);
                    expect(res.data.data[libraryGqlQuery].list.length).toBe(3);
                    expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId3);
                    expect(res.data.data[libraryGqlQuery].list[1].id).toBe(recordId2);
                    expect(res.data.data[libraryGqlQuery].list[2].id).toBe(recordId1);
                });
            });
        });

        describe('Advanced link attribute', () => {
            beforeAll(async () => {
                await gqlSaveValue(advancedLinkAttributeId, libraryId, recordId1, linkedRecordId1);
                await gqlSaveValue(advancedLinkAttributeId, libraryId, recordId2, linkedRecordId2);
            });

            test('Contains', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${advancedLinkAttributeId}",
                            condition: ${AttributeCondition.CONTAINS},
                            value: "${linkedRecordId1}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });

            test('Do not contains', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${advancedLinkAttributeId}",
                            condition: ${AttributeCondition.NOT_CONTAINS},
                            value: "${linkedRecordId1}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId2);
            });

            test('Start with', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${advancedLinkAttributeId}",
                            condition: ${AttributeCondition.BEGIN_WITH},
                            value: "${linkedRecordId1}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });

            test('End with', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${advancedLinkAttributeId}",
                            condition: ${AttributeCondition.END_WITH},
                            value: "${linkedRecordId1.slice(-4)}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });

            test('Is empty', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${advancedLinkAttributeId}",
                            condition: ${AttributeCondition.IS_EMPTY}
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId3);
            });

            test('Is not empty', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${advancedLinkAttributeId}",
                            condition: ${AttributeCondition.IS_NOT_EMPTY}
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(2);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId2);
                expect(res.data.data[libraryGqlQuery].list[1].id).toBe(recordId1);
            });

            describe('Values count', () => {
                beforeAll(async () => {
                    await gqlSaveValue(advancedLinkMultivalAttributeId, libraryId, recordId1, linkedRecordId1);

                    await gqlSaveValue(advancedLinkMultivalAttributeId, libraryId, recordId2, linkedRecordId1);
                    await gqlSaveValue(advancedLinkMultivalAttributeId, libraryId, recordId2, linkedRecordId2);

                    await gqlSaveValue(advancedLinkMultivalAttributeId, libraryId, recordId3, linkedRecordId1);
                    await gqlSaveValue(advancedLinkMultivalAttributeId, libraryId, recordId3, linkedRecordId2);
                    await gqlSaveValue(advancedLinkMultivalAttributeId, libraryId, recordId3, linkedRecordId3);
                });

                test('Equal', async () => {
                    const res = await makeGraphQlCall(`{
                        ${libraryGqlQuery}(
                            filters: [{
                                field: "${advancedLinkMultivalAttributeId}",
                                condition: ${AttributeCondition.VALUES_COUNT_EQUAL},
                                value: "2"
                            }]) {
                                list {id}
                            }
                        }`);

                    expect(res.data.errors).toBeUndefined();
                    expect(res.status).toBe(200);
                    expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                    expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId2);
                });

                test('Greater than', async () => {
                    const res = await makeGraphQlCall(`{
                        ${libraryGqlQuery}(
                            filters: [{
                                field: "${advancedLinkMultivalAttributeId}",
                                condition: ${AttributeCondition.VALUES_COUNT_GREATER_THAN},
                                value: "2"
                            }]) {
                                list {id}
                            }
                        }`);

                    expect(res.data.errors).toBeUndefined();
                    expect(res.status).toBe(200);
                    expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                    expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId3);
                });

                test('Lower than', async () => {
                    const res = await makeGraphQlCall(`{
                        ${libraryGqlQuery}(
                            filters: [{
                                field: "${advancedLinkMultivalAttributeId}",
                                condition: ${AttributeCondition.VALUES_COUNT_LOWER_THAN},
                                value: "2"
                            }]) {
                                list {id}
                            }
                        }`);

                    expect(res.data.errors).toBeUndefined();
                    expect(res.status).toBe(200);
                    expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                    expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
                });
            });
        });

        describe('Tree attribute', () => {
            let nodeTreeRecordId1;
            let nodeTreeRecordId2;
            let nodeTreeRecordId3;

            beforeAll(async () => {
                nodeTreeRecordId1 = await gqlAddElemToTree(treeId, {id: treeRecordId1, library: treeLibraryId});

                nodeTreeRecordId2 = await gqlAddElemToTree(treeId, {id: treeRecordId2, library: treeLibraryId});
                nodeTreeRecordId3 = await gqlAddElemToTree(treeId, {id: treeRecordId3, library: treeLibraryId});

                await gqlSaveValue(treeAttributeId, libraryId, recordId1, nodeTreeRecordId1);
                await gqlSaveValue(treeAttributeId, libraryId, recordId2, nodeTreeRecordId2);
            });

            test('Contains', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${treeAttributeId}",
                            condition: ${AttributeCondition.CONTAINS},
                            value: "${treeRecordId1}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });

            test('Do not contains', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${treeAttributeId}",
                            condition: ${AttributeCondition.NOT_CONTAINS},
                            value: "${treeRecordId1}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId2);
            });

            test('Start with', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${treeAttributeId}",
                            condition: ${AttributeCondition.BEGIN_WITH},
                            value: "${treeRecordId1}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });

            test('End with', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${treeAttributeId}",
                            condition: ${AttributeCondition.END_WITH},
                            value: "${treeRecordId1.slice(-4)}"
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
            });

            test('Is empty', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${treeAttributeId}",
                            condition: ${AttributeCondition.IS_EMPTY}
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId3);
            });

            test('Is not empty', async () => {
                const res = await makeGraphQlCall(`{
                    ${libraryGqlQuery}(
                        filters: [{
                            field: "${advancedLinkAttributeId}",
                            condition: ${AttributeCondition.IS_NOT_EMPTY}
                        }]) {
                            list {id}
                        }
                    }`);

                expect(res.data.errors).toBeUndefined();
                expect(res.status).toBe(200);
                expect(res.data.data[libraryGqlQuery].list.length).toBe(2);
                expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId2);
                expect(res.data.data[libraryGqlQuery].list[1].id).toBe(recordId1);
            });

            describe('Values count', () => {
                beforeAll(async () => {
                    await gqlSaveValue(treeMultivalAttributeId, libraryId, recordId1, nodeTreeRecordId1);

                    await gqlSaveValue(treeMultivalAttributeId, libraryId, recordId2, nodeTreeRecordId1);
                    await gqlSaveValue(treeMultivalAttributeId, libraryId, recordId2, nodeTreeRecordId2);

                    await gqlSaveValue(treeMultivalAttributeId, libraryId, recordId3, nodeTreeRecordId1);
                    await gqlSaveValue(treeMultivalAttributeId, libraryId, recordId3, nodeTreeRecordId2);
                    await gqlSaveValue(treeMultivalAttributeId, libraryId, recordId3, nodeTreeRecordId3);
                });

                test('Equal', async () => {
                    const res = await makeGraphQlCall(`{
                        ${libraryGqlQuery}(
                            filters: [{
                                field: "${treeMultivalAttributeId}",
                                condition: ${AttributeCondition.VALUES_COUNT_EQUAL},
                                value: "2"
                            }]) {
                                list {id}
                            }
                        }`);

                    expect(res.data.errors).toBeUndefined();
                    expect(res.status).toBe(200);
                    expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                    expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId2);
                });

                test('Greater than', async () => {
                    const res = await makeGraphQlCall(`{
                        ${libraryGqlQuery}(
                            filters: [{
                                field: "${treeMultivalAttributeId}",
                                condition: ${AttributeCondition.VALUES_COUNT_GREATER_THAN},
                                value: "2"
                            }]) {
                                list {id}
                            }
                        }`);

                    expect(res.data.errors).toBeUndefined();
                    expect(res.status).toBe(200);
                    expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                    expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId3);
                });

                test('Lower than', async () => {
                    const res = await makeGraphQlCall(`{
                        ${libraryGqlQuery}(
                            filters: [{
                                field: "${treeMultivalAttributeId}",
                                condition: ${AttributeCondition.VALUES_COUNT_LOWER_THAN},
                                value: "2"
                            }]) {
                                list {id}
                            }
                        }`);

                    expect(res.data.errors).toBeUndefined();
                    expect(res.status).toBe(200);
                    expect(res.data.data[libraryGqlQuery].list.length).toBe(1);
                    expect(res.data.data[libraryGqlQuery].list[0].id).toBe(recordId1);
                });
            });
        });
    });

    describe('Filters operators (AND, OR)', () => {
        beforeAll(async () => {
            await gqlSaveValue(textAttributeId, libraryForOperatorsId, recordIdForOperators1, 'my_value');
            await gqlSaveValue(textAttributeId, libraryForOperatorsId, recordIdForOperators2, 'other_value');
            await gqlSaveValue(textAttributeId, libraryForOperatorsId, recordIdForOperators3, 'last_value');
        });

        test('Multiple filters with AND', async () => {
            const res = await makeGraphQlCall(`{
                ${libraryForOperatorsGqlQuery}(
                    filters: [
                        {
                            field: "${textAttributeId}",
                            condition: ${AttributeCondition.CONTAINS},
                            value: "my"
                        },
                        {
                            operator: AND,
                        },
                        {
                            field: "${textAttributeId}",
                            condition: ${AttributeCondition.CONTAINS},
                            value: "value"
                        }
                    ]) {
                        list {id}
                    }
                }`);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data[libraryForOperatorsGqlQuery].list.length).toBe(1);
            expect(res.data.data[libraryForOperatorsGqlQuery].list[0].id).toBe(recordIdForOperators1);
        });

        test('Multiple filters with OR', async () => {
            const res = await makeGraphQlCall(`{
                ${libraryForOperatorsGqlQuery}(
                    filters: [
                        {
                            field: "${textAttributeId}",
                            condition: ${AttributeCondition.CONTAINS},
                            value: "my"
                        },
                        {
                            operator: OR,
                        },
                        {
                            field: "${textAttributeId}",
                            condition: ${AttributeCondition.CONTAINS},
                            value: "other"
                        }
                    ]) {
                        list {id}
                    }
                }`);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data[libraryForOperatorsGqlQuery].list.length).toBe(2);
            expect(res.data.data[libraryForOperatorsGqlQuery].list[0].id).toBe(recordIdForOperators2);
            expect(res.data.data[libraryForOperatorsGqlQuery].list[1].id).toBe(recordIdForOperators1);
        });

        test('Multiple filters with AND and OR', async () => {
            const res = await makeGraphQlCall(`{
                ${libraryForOperatorsGqlQuery}(
                    filters: [
                        {
                            field: "${textAttributeId}",
                            condition: ${AttributeCondition.CONTAINS},
                            value: "my"
                        },
                        {
                            operator: OR,
                        },
                        {
                            operator: OPEN_BRACKET,
                        },
                        {
                            field: "${textAttributeId}",
                            condition: ${AttributeCondition.CONTAINS},
                            value: "other"
                        },
                        {
                            operator: AND,
                        },
                        {
                            field: "${textAttributeId}",
                            condition: ${AttributeCondition.CONTAINS},
                            value: "value"
                        },
                        {
                            operator: CLOSE_BRACKET,
                        },
                    ]) {
                        list {id}
                    }
                }`);

            expect(res.data.errors).toBeUndefined();
            expect(res.status).toBe(200);
            expect(res.data.data[libraryForOperatorsGqlQuery].list.length).toBe(2);
            expect(res.data.data[libraryForOperatorsGqlQuery].list[0].id).toBe(recordIdForOperators2);
            expect(res.data.data[libraryForOperatorsGqlQuery].list[1].id).toBe(recordIdForOperators1);
        });
    });
});
