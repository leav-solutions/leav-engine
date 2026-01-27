// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import axios from 'axios';
import FormData from 'form-data';
import config from '../config';
import {GenericClient} from './GenericClient';
import {TaskUtil} from './TaskUtils';
import {TaskStatus} from '../../../../apps/core/src/_types/tasksManager';

export class DataClient extends GenericClient {
    public async importData(serializedData: string): Promise<string> {
        const query = `
        mutation ImportData($file: Upload!) {
          importData(file: $file)
        }
      `;

        const map = {0: ['variables.file']};
        const form = new FormData();
        form.append('operations', JSON.stringify({query, variables: {file: null}}));
        form.append('map', JSON.stringify(map));
        const fileBuffer = Buffer.from(serializedData, 'utf-8');
        form.append('0', fileBuffer, {
            filename: 'dataLoadedFromJSON.json',
            contentType: 'application/json',
        });
        const response = await axios.post(`${config.baseUrl}/graphql`, form, {
            headers: {
                ...form.getHeaders(),
                'x-apollo-operation-name': 'ImportData',
            },
            params: {
                key: config.testApiKey,
            },
        });
        const taskId = response.data.data.importData;
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
            const query = `
                query GetRecords($library: ID!) {
                  records(library: $library, retrieveInactive: true) {
                    list {
                      id
                    }
                  }
                }
            `;
            const response: any = await this.makeGraphqlCall(query, {library: libraryId});
            const records = response?.data?.records?.list ?? [];
            const recordsId = records.map(r => r.id);
            const deactivate = `
              mutation DeactivateRecords($libraryId: String!, $recordsIds: [String!]!){
                deactivateRecords(
                  libraryId: $libraryId
                  recordsIds: $recordsIds
                ) {
                  id
                }
              }
            `;
            const deactivatePayload = {
                libraryId,
                recordsIds: recordsId,
            };
            await this.makeGraphqlCall(deactivate, deactivatePayload);
            for (const r of recordsId) {
                const purge = `
            mutation Purge($libraryId: ID!, $recordId: ID!) {
              purgeRecord(libraryId: $libraryId, recordId: $recordId) {
                id
              }
            }`;
                const purgePayload = {
                    libraryId,
                    recordId: r,
                };
                await this.makeGraphqlCall(purge, purgePayload);
            }
        }
    }
}
