import {AttributeFormat, AttributeType, RecordFilterCondition, SortOrder} from '../../../_gqlTypes';
import {adminUserSdk} from '../../e2eUtils';

describe('recordsGroups', () => {
    const remoteLibName = 'records_groups_remote_lib_test';
    const testLibName = 'records_groups_library_test';

    const attrColorName = 'records_groups_color'; // simple text
    const attrLinkName = 'records_groups_link'; // simple link

    // Expected group cardinalities built in beforeAll:
    // color: red = 3, blue = 2, null (no value) = 1  => 3 groups
    // link:  remoteA = 2, remoteB = 2, null = 2       => 3 groups
    const RED_COUNT = 3;
    const BLUE_COUNT = 2;
    const COLOR_NULL_COUNT = 1;
    const COLOR_GROUPS_COUNT = 3;

    let remoteRecordAId: string;
    let remoteRecordBId: string;

    const createRecord = async (library: string, values: Array<{attribute: string; payload: string}>) => {
        const {createRecord: _createRecord} = await adminUserSdk.CreateRecord({library, data: {values}});
        return _createRecord.record.id;
    };

    const recordsCount = async (
        filters: Array<{field: string; condition: RecordFilterCondition; value?: string}>,
        searchQuery?: string,
    ) => {
        const {records} = await adminUserSdk.RecordsCount({library: testLibName, filters, searchQuery});
        return records.totalCount;
    };

    beforeAll(async () => {
        await adminUserSdk.SaveLibrary({library: {id: remoteLibName, label: {en: 'Records groups remote lib'}}});

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: attrColorName,
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {en: 'Color'},
            },
        });
        await adminUserSdk.SaveAttribute({
            attribute: {
                id: attrLinkName,
                type: AttributeType.simple_link,
                label: {en: 'Link'},
                linked_library: remoteLibName,
            },
        });

        await adminUserSdk.SaveLibrary({
            library: {id: testLibName, label: {en: 'Records groups lib'}, attributes: [attrColorName, attrLinkName]},
        });

        remoteRecordAId = await createRecord(remoteLibName, []);
        remoteRecordBId = await createRecord(remoteLibName, []);

        await createRecord(testLibName, [
            {attribute: attrColorName, payload: 'red'},
            {attribute: attrLinkName, payload: remoteRecordAId},
        ]);
        await createRecord(testLibName, [
            {attribute: attrColorName, payload: 'red'},
            {attribute: attrLinkName, payload: remoteRecordAId},
        ]);
        await createRecord(testLibName, [
            {attribute: attrColorName, payload: 'red'},
            {attribute: attrLinkName, payload: remoteRecordBId},
        ]);
        await createRecord(testLibName, [
            {attribute: attrColorName, payload: 'blue'},
            {attribute: attrLinkName, payload: remoteRecordBId},
        ]);
        await createRecord(testLibName, [{attribute: attrColorName, payload: 'blue'}]);
        await createRecord(testLibName, []); // no color, no link -> null bucket for both
    });

    describe('grouping by a simple attribute', () => {
        test('enumerates groups with their counts, including the null bucket', async () => {
            const {recordsGroups} = await adminUserSdk.RecordsGroups({library: testLibName, attribute: attrColorName});

            expect(recordsGroups.totalCount).toBe(COLOR_GROUPS_COUNT);
            expect(recordsGroups.list).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({standardValue: 'red', count: RED_COUNT}),
                    expect.objectContaining({standardValue: 'blue', count: BLUE_COUNT}),
                    expect.objectContaining({standardValue: null, count: COLOR_NULL_COUNT}),
                ]),
            );
        });
    });

    describe('sorting the groups by count', () => {
        test('desc (default) returns biggest groups first, null bucket last', async () => {
            const {recordsGroups} = await adminUserSdk.RecordsGroups({
                library: testLibName,
                attribute: attrColorName,
                sort: {order: SortOrder.desc},
            });

            expect(recordsGroups.list).toEqual([
                expect.objectContaining({standardValue: 'red', count: RED_COUNT}),
                expect.objectContaining({standardValue: 'blue', count: BLUE_COUNT}),
                expect.objectContaining({standardValue: null, count: COLOR_NULL_COUNT}),
            ]);
        });

        test('asc returns smallest groups first, null bucket still last', async () => {
            const {recordsGroups} = await adminUserSdk.RecordsGroups({
                library: testLibName,
                attribute: attrColorName,
                sort: {order: SortOrder.asc},
            });

            expect(recordsGroups.list).toEqual([
                expect.objectContaining({standardValue: 'blue', count: BLUE_COUNT}),
                expect.objectContaining({standardValue: 'red', count: RED_COUNT}),
                expect.objectContaining({standardValue: null, count: COLOR_NULL_COUNT}),
            ]);
        });
    });

    describe('paginating the groups', () => {
        test('totalCount stays the full count while list is sliced', async () => {
            const firstPage = await adminUserSdk.RecordsGroups({
                library: testLibName,
                attribute: attrColorName,
                sort: {order: SortOrder.desc},
                pagination: {limit: 1, offset: 0},
            });
            const secondPage = await adminUserSdk.RecordsGroups({
                library: testLibName,
                attribute: attrColorName,
                sort: {order: SortOrder.desc},
                pagination: {limit: 1, offset: 1},
            });

            expect(firstPage.recordsGroups.totalCount).toBe(COLOR_GROUPS_COUNT);
            expect(firstPage.recordsGroups.list).toEqual([
                expect.objectContaining({standardValue: 'red', count: RED_COUNT}),
            ]);
            expect(secondPage.recordsGroups.totalCount).toBe(COLOR_GROUPS_COUNT);
            expect(secondPage.recordsGroups.list).toEqual([
                expect.objectContaining({standardValue: 'blue', count: BLUE_COUNT}),
            ]);
        });
    });

    describe('grouping by a link attribute', () => {
        test('enumerates linked records as groups with their counts', async () => {
            const {recordsGroups} = await adminUserSdk.RecordsGroups({library: testLibName, attribute: attrLinkName});

            expect(recordsGroups.totalCount).toBe(3);
            expect(recordsGroups.list).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({linkValue: {id: remoteRecordAId}, count: 2}),
                    expect.objectContaining({linkValue: {id: remoteRecordBId}, count: 2}),
                    expect.objectContaining({linkValue: null, count: 2}),
                ]),
            );
        });
    });

    describe('invariant: a group count equals the number of records matching its equality filter', () => {
        test('holds for simple value groups and the null bucket', async () => {
            expect(
                await recordsCount([{field: attrColorName, condition: RecordFilterCondition.EQUAL, value: 'red'}]),
            ).toBe(RED_COUNT);
            expect(
                await recordsCount([{field: attrColorName, condition: RecordFilterCondition.EQUAL, value: 'blue'}]),
            ).toBe(BLUE_COUNT);
            expect(await recordsCount([{field: attrColorName, condition: RecordFilterCondition.IS_EMPTY}])).toBe(
                COLOR_NULL_COUNT,
            );
        });

        test('holds for link value groups (field "attr.id" EQUAL linkedRecordId)', async () => {
            expect(
                await recordsCount([
                    {field: `${attrLinkName}.id`, condition: RecordFilterCondition.EQUAL, value: remoteRecordAId},
                ]),
            ).toBe(2);
        });
    });

    describe('searchQuery keeps the groups counts consistent', () => {
        test('each group count equals records(sameSearchQuery + group equality filter).totalCount', async () => {
            const searchQuery = 'red';
            const {recordsGroups} = await adminUserSdk.RecordsGroups({
                library: testLibName,
                attribute: attrColorName,
                searchQuery,
            });

            for (const group of recordsGroups.list) {
                // A simple attribute only yields StandardDistinctValues groups; narrow the union for TS.
                if (!('standardValue' in group)) {
                    continue;
                }

                const filter =
                    group.standardValue === null
                        ? [{field: attrColorName, condition: RecordFilterCondition.IS_EMPTY}]
                        : [
                              {
                                  field: attrColorName,
                                  condition: RecordFilterCondition.EQUAL,
                                  value: String(group.standardValue),
                              },
                          ];

                expect(await recordsCount(filter, searchQuery)).toBe(group.count);
            }
        });
    });
});
