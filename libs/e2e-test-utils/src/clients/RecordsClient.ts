import {GenericClient} from './GenericClient';
import {TasksClient as TaskUtils} from './TasksClient';
import {ImportDataDocument, TaskStatus, type ImportDataMutation, type ImportDataMutationVariables} from '../_gqlTypes';

export class RecordsClient extends GenericClient {
    public async importDataJson(serializedData: string): Promise<string> {
        const res = await this.graphqlRequestWithFiles<ImportDataMutation, ImportDataMutationVariables>(
            ImportDataDocument,
            [{variableName: 'file', file: new File([serializedData], 'data.json', {type: 'application/json'})}],
        );

        const taskId = res.importData;
        if (!taskId) {
            throw new Error('Import taskId not returned');
        }
        const taskUtil = new TaskUtils();
        const task = await taskUtil.waitForTaskCompletion(taskId);
        if (task.status !== TaskStatus.DONE) {
            throw new Error('Task ' + taskId + ' finished with status ' + task.status);
        }
        return taskId;
    }

    public async deleteAndPurgeLibrariesRecords(librariesId: string[]): Promise<void> {
        for (const libraryId of librariesId) {
            const recordsResponse = await this.baseSdk.GetRecords({library: libraryId});
            const records = recordsResponse?.records?.list ?? [];
            const recordsId = records.map(r => r.id);

            await this.baseSdk.DeactivateRecords({libraryId, recordsIds: recordsId});

            for (const r of recordsId) {
                await this.baseSdk.PurgeRecord({libraryId, recordId: r});
            }
        }
    }
}
