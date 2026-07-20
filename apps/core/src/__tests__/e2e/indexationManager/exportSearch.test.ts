import {AttributeFormat, AttributeType} from '../_gqlTypes';
import {adminUserSdk} from '../api/e2eUtils';
import {waitForTaskCompletion} from '../api/taskUtils';
import {TaskStatus} from '../../../_types/tasksManager';
import getFileDataBuffer from '../../../utils/helpers/getFileDataBuffer';
import getExcelData from '../../../utils/helpers/getExcelData';

describe('export with fulltext search', () => {
    const libId = 'export_search_lib';
    const attrId = 'export_search_attr';

    const exportProfileConfig = {
        export: {
            defaultProfile: 'default',
            profiles: [
                {
                    label: 'default',
                    columns: [{columnLabel: 'id', attribute: 'id'}],
                },
            ],
        },
    };

    let alphaRecord1: string;
    let alphaRecord2: string;
    let bravoRecord: string;

    const waitForIndexedCount = (searchQuery: string, expectedCount: number): Promise<void> =>
        vi.waitFor(
            async () => {
                const {records} = await adminUserSdk.SearchRecords({libraryId: libId, searchQuery});
                expect(records.list).toHaveLength(expectedCount);
            },
            {timeout: 10_000, interval: 500},
        );

    // Extract the "id" column (single column of the default profile) from the exported Excel file,
    // skipping the two header rows (custom label + attribute label).
    const exportedIds = async (searchQuery: string): Promise<string[]> => {
        const {export: taskId} = await adminUserSdk.Export({library: libId, searchQuery});
        const task = await waitForTaskCompletion(taskId, 20_000);
        expect(task.status, `export task ${taskId} ended as ${task.status}`).toBe(TaskStatus.DONE);
        const buffer = await getFileDataBuffer(task.link.url);
        const [sheet] = await getExcelData(buffer);
        return sheet.slice(2).map(row => row[0]);
    };

    beforeAll(async () => {
        await adminUserSdk.SaveAttribute({
            attribute: {
                id: attrId,
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {en: 'Export search attr'},
            },
        });

        await adminUserSdk.SaveLibrary({
            library: {
                id: libId,
                label: {en: 'Export search lib'},
                attributes: [attrId],
                fullTextAttributes: [attrId],
                settings: exportProfileConfig,
            },
        });

        const create = async (payload: string): Promise<string> => {
            const {createRecord} = await adminUserSdk.CreateRecord({
                library: libId,
                data: {values: [{attribute: attrId, payload}]},
            });
            return createRecord.record.id;
        };

        alphaRecord1 = await create('alpha unique');
        alphaRecord2 = await create('alpha unique');
        bravoRecord = await create('bravo distinct');

        // Wait for indexation to catch up before exercising fulltext-scoped export.
        await waitForIndexedCount('alpha', 2);
        await waitForIndexedCount('bravo', 1);
    });

    test('a matching searchQuery only exports the matching records', async () => {
        const ids = await exportedIds('alpha');

        expect(ids.sort()).toEqual([alphaRecord1, alphaRecord2].sort());
        expect(ids).not.toContain(bravoRecord);
    });

    test('a non-matching searchQuery exports nothing (does not export the whole library)', async () => {
        const ids = await exportedIds('zzznomatch');

        expect(ids).toHaveLength(0);
    });
});
