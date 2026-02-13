// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GenericClient} from './GenericClient';
import {TaskUtil} from './TaskUtils';
import {ImportDataDocument, TaskStatus, type ImportDataMutation, type ImportDataMutationVariables} from '../_gqlTypes';

export class DataClient extends GenericClient {
    public async importData(serializedData: string): Promise<string> {
        const res = await this.graphqlRequestWithFiles<ImportDataMutation, ImportDataMutationVariables>(
            ImportDataDocument,
            [{variableName: 'file', file: new File([serializedData], 'data.json', {type: 'application/json'})}],
        );

        const taskId = res.importData;
        if (!taskId) {
            throw new Error('Import taskId not returned');
        }
        const taskUtil = new TaskUtil();
        const task = await taskUtil.waitForTaskCompletion(taskId);
        if (task.status !== TaskStatus.DONE) {
            throw new Error('Task ' + taskId + ' finished with status ' + task.status);
        }
        return taskId;
    }

    public async deleteData(librariesId: string[]): Promise<void> {
        for (const libraryId of librariesId) {
            const recordsResponse = await this.sdk.GetRecords({library: libraryId});
            const records = recordsResponse?.records?.list ?? [];
            const recordsId = records.map(r => r.id);

            await this.sdk.DeactivateRecords({libraryId, recordsIds: recordsId});

            for (const r of recordsId) {
                await this.sdk.PurgeRecord({libraryId, recordId: r});
            }
        }
    }
}
