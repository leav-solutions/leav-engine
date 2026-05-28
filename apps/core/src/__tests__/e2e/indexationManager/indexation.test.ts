import {makeGraphQlCall} from '../api/e2eUtils';

type RecordsResult = {totalCount: number; list: Array<{id: string}>};

const searchRecords = async (recordsArgs: string): Promise<RecordsResult> => {
    const res = await makeGraphQlCall(`{
        records(${recordsArgs}) {
            totalCount
            list {id}
        }
    }`);
    expect(res.data.errors).toBeUndefined();
    expect(res.status).toBe(200);
    return res.data.data.records;
};

const searchUntil = async (
    recordsArgs: string,
    predicate: (result: RecordsResult) => boolean,
    {timeout = 10_000, interval = 500}: {timeout?: number; interval?: number} = {},
): Promise<RecordsResult> => {
    const start = Date.now();
    let last: RecordsResult | undefined;
    while (Date.now() - start < timeout) {
        last = await searchRecords(recordsArgs);
        if (predicate(last)) {
            return last;
        }
        await new Promise(resolve => globalThis.setTimeout(resolve, interval));
    }
    throw new Error(`searchUntil(${recordsArgs}) timed out after ${timeout}ms — last result: ${JSON.stringify(last)}`);
};

describe('Indexation', () => {
    const testLibName = 'indexation_library_test';
    const attrId = 'indexation_attribute_test';

    let record1: string;
    let record2: string;

    beforeAll(async () => {
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "users", recordIdentityConf: { label: "login" }}) { id }
        }`);

        await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${attrId}",
                    readonly: false,
                    required: false,
                    type: simple,
                    format: text,
                    label: {fr: "Test attr", en: "Test attr en"},
                    description: {fr: "Test attr", en: "Test attr en"},
                }
            ) {
                id
            }
        }`);

        await makeGraphQlCall(`mutation {
            saveLibrary(
                library: {
                    id: "${testLibName}",
                    attributes: ["${attrId}"],
                    fullTextAttributes: ["created_by", "${attrId}"]
                }
            ) { id }
        }`);

        const rec1 = await makeGraphQlCall(
            `mutation { createRecord(library: "${testLibName}", skipActivate: true) { record {id} } }`,
        );
        const rec2 = await makeGraphQlCall(
            `mutation { createRecord(library: "${testLibName}", skipActivate: true) { record {id} } }`,
        );

        record1 = rec1.data.data.createRecord.record.id;
        record2 = rec2.data.data.createRecord.record.id;

        await makeGraphQlCall(`mutation {
            saveValue(
                library: "${testLibName}",
                recordId: "${record1}",
                attribute: "${attrId}",
                value: {payload: "one two three"}
            ) {
                attribute {
                    id
                }
                id_value
            }
        }`);

        await makeGraphQlCall(`mutation {
            activateRecords(
                libraryId: "${testLibName}",
                recordsIds: ["${record1}", "${record2}"],
            ) {
                id
            }
        }`);

        // Wait for indexation to catch up: both records must be searchable AND
        // the typed value "one two three" must be indexed on record1.
        await searchUntil(
            `library: "${testLibName}", searchQuery: "admin", sort: {field: "id", order: asc}`,
            r => r.list.length === 2,
        );
        await searchUntil(`library: "${testLibName}", searchQuery: "one two three"`, r => r.list.length === 1);
    });

    test('Search records', async () => {
        const records = await searchRecords(
            `library: "${testLibName}", searchQuery: "admin", sort: {field: "id", order: asc}`,
        );
        expect(records.list.length).toBe(2);
    });

    test('Search records with start of the word', async () => {
        const records = await searchRecords(
            `library: "${testLibName}", searchQuery: "adm", sort: {field: "id", order: asc}`,
        );
        expect(records.list.length).toBe(2);
    });

    test('Search records with phrase (all words matches)', async () => {
        const records = await searchRecords(`library: "${testLibName}", searchQuery: "one two three"`);
        expect(records.list.length).toBe(1);
    });

    test('Search records with phrase (1 word match only)', async () => {
        const records = await searchRecords(`library: "${testLibName}", searchQuery: "one rrr uuu"`);
        expect(records.list.length).toBe(0);
    });

    test('Search records with phrase (no matches)', async () => {
        const records = await searchRecords(`library: "${testLibName}", searchQuery: "zzz www iii"`);
        expect(records.list.length).toBe(0);
    });

    describe('Fuzzy search (NGRAM_MATCH)', () => {
        const fuzzyLibName = 'indexation_fuzzy_library_test';
        const fuzzyAttrId = 'indexation_fuzzy_attribute_test';
        let avocadoRecord: string;
        let bananaRecord: string;
        let strawberryRecord: string;

        beforeAll(async () => {
            await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${fuzzyAttrId}",
                        readonly: false,
                        required: false,
                        type: simple,
                        format: text,
                        label: {fr: "Fuzzy test attr", en: "Fuzzy test attr"},
                    }
                ) { id }
            }`);

            await makeGraphQlCall(`mutation {
                saveLibrary(
                    library: {
                        id: "${fuzzyLibName}",
                        attributes: ["${fuzzyAttrId}"],
                        fullTextAttributes: ["${fuzzyAttrId}"]
                    }
                ) { id }
            }`);

            const createAndSetValue = async (value: string) => {
                const res = await makeGraphQlCall(
                    `mutation { createRecord(library: "${fuzzyLibName}", skipActivate: true) { record {id} } }`,
                );
                const id = res.data.data.createRecord.record.id;
                await makeGraphQlCall(`mutation {
                    saveValue(
                        library: "${fuzzyLibName}",
                        recordId: "${id}",
                        attribute: "${fuzzyAttrId}",
                        value: {payload: "${value}"}
                    ) { id_value }
                }`);
                return id;
            };

            avocadoRecord = await createAndSetValue('avocado');
            bananaRecord = await createAndSetValue('banana');
            strawberryRecord = await createAndSetValue('strawberry');

            await makeGraphQlCall(`mutation {
                activateRecords(
                    libraryId: "${fuzzyLibName}",
                    recordsIds: ["${avocadoRecord}", "${bananaRecord}", "${strawberryRecord}"],
                ) { id }
            }`);

            // Wait for indexation: the three known values must be searchable as exact matches
            // before exercising fuzzy queries (which would also match before indexation is done
            // for some queries, masking incomplete state).
            await searchUntil(`library: "${fuzzyLibName}", searchQuery: "avocado"`, r => r.list.length === 1);
            await searchUntil(`library: "${fuzzyLibName}", searchQuery: "banana"`, r => r.list.length === 1);
            await searchUntil(`library: "${fuzzyLibName}", searchQuery: "strawberry"`, r => r.list.length === 1);
        });

        const search = async (query: string) => {
            const records = await searchRecords(`library: "${fuzzyLibName}", searchQuery: "${query}"`);
            return records.list.map(r => r.id);
        };

        test('Substring match: "voca" finds "avocado"', async () => {
            const ids = await search('voca');
            expect(ids).toContain(avocadoRecord);
        });

        test('Missing-char typo on long word: "strawbery" finds "strawberry"', async () => {
            const ids = await search('strawbery');
            expect(ids).toContain(strawberryRecord);
        });

        test('Extra-char typo on long word: "strawberryy" finds "strawberry"', async () => {
            const ids = await search('strawberryy');
            expect(ids).toContain(strawberryRecord);
        });

        test('Single-char typo on short word stays below threshold: "banaan" does not find "banana"', async () => {
            const ids = await search('banaan');
            expect(ids).not.toContain(bananaRecord);
        });

        test('Unrelated query does not return everything', async () => {
            const ids = await search('xyzqqq');
            expect(ids).toHaveLength(0);
        });
    });

    test('Search records with from / size params', async () => {
        const records = await searchRecords(
            `library: "${testLibName}", searchQuery: "admin", pagination: {limit: 1, offset: 0}, sort: {field: "id", order: asc}`,
        );
        expect(records.list.length).toBe(1);
    });
});
