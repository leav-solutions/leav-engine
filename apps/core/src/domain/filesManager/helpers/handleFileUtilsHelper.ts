// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {UpdateRecordLastModifFunc} from 'domain/helpers/updateRecordLastModif';
import {SendRecordUpdateEventHelper} from 'domain/record/helpers/sendRecordUpdateEvent';
import {IValueDomain} from 'domain/value/valueDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import {basename, dirname} from 'path';
import * as Config from '_types/config';
import {ILibrary} from '_types/library';
import {IQueryInfos} from '_types/queryInfos';
import {IFileMetadata, IPreviews, IPreviewsStatus} from '../../../_types/filesManager';
import {IRecord} from '../../../_types/record';
import {IHandleFileSystemEventDeps} from './handleFileSystemEvent/_types';
import winston = require('winston');

export const getRecord = async (
    {fileName, filePath, fileInode}: {fileName: string; filePath: string; fileInode?: number},
    {recordLibrary, recordId}: {recordLibrary: string; recordId?: string},
    retrieveInactive: boolean,
    deps: IHandleFileSystemEventDeps,
    ctx: IQueryInfos
): Promise<IRecord | null> => {
    return deps.filesManagerRepo.getRecord(
        {fileName, filePath, fileInode},
        {recordLibrary, recordId},
        retrieveInactive,
        ctx
    );
};

export const getParentRecord = async (
    fullParentPath: string,
    library: string,
    deps: IHandleFileSystemEventDeps,
    ctx: IQueryInfos
): Promise<IRecord | null> => {
    return deps.filesManagerRepo.getParentRecord(fullParentPath, library, ctx);
};

export const createRecordFile = async (
    recordData: IFileMetadata,
    library: string,
    deps: IHandleFileSystemEventDeps,
    ctx: IQueryInfos
) => {
    const {userId} = deps.config.filesManager;
    let newRecord: IRecord;

    try {
        newRecord = await deps.recordDomain.createRecord({library, ctx: {...ctx, userId}});
    } catch (e) {
        deps.logger.warn(`[FilesManager] Error when create new record : ${e.message}`);
    }

    if (newRecord.id) {
        const dataToSave: IRecord = Object.keys(recordData).reduce((acc, key) => {
            acc[key] = typeof recordData[key] === 'object' ? JSON.stringify(recordData[key]) : recordData[key];
            return acc;
        }, {});
        dataToSave.id = newRecord.id;

        try {
            await deps.recordDomain.updateRecord({
                library,
                recordData: dataToSave,
                ctx
            });
        } catch (e) {
            deps.logger.warn(`[FilesManager] Error when saving values for new record : ${newRecord.id}`, e.message);
        }
    }

    return newRecord;
};

export const updateRecordFile = async (
    recordData: IFileMetadata,
    recordId: string,
    library: string,
    deps: {
        valueDomain?: IValueDomain;
        recordRepo?: IRecordRepo;
        updateRecordLastModif?: UpdateRecordLastModifFunc;
        sendRecordUpdateEvent?: SendRecordUpdateEventHelper;
        config?: Config.IConfig;
        logger?: winston.Winston;
    },
    ctx: IQueryInfos
) => {
    // Update record file attributes
    const dataToSave: IRecord = Object.keys(recordData).reduce((acc, key) => {
        acc[key] = recordData[key];
        return acc;
    }, {});
    dataToSave.id = recordId;

    try {
        await deps.recordRepo.updateRecord({
            libraryId: library,
            recordData: dataToSave
        });

        await deps.updateRecordLastModif(library, recordId, ctx);

        await deps.sendRecordUpdateEvent(
            {...dataToSave, library},
            Object.keys(recordData).map(attributeId => ({
                id_value: null,
                attribute: attributeId,
                value: {value: recordData[attributeId], raw_value: recordData[attributeId], attribute: attributeId},
                modified_at: null,
                modified_by: null,
                created_at: null,
                created_by: null,
                version: null,
                metadata: null
            })),
            ctx
        );
    } catch (e) {
        deps.logger.warn(`[${ctx.queryId}] Error when updating record: ${recordId}, ${e.message}`);
        deps.logger.warn(`[${ctx.queryId}] ${e.stack}`);
    }
};

export const getInputData = (input: string) => {
    const filePath = dirname(input);
    const fileName = basename(input);

    return {filePath, fileName};
};

export const createFilesTreeElement = async (
    record: IRecord,
    parentRecord: IRecord,
    filesLibraryId: string,
    deps: IHandleFileSystemEventDeps,
    ctx: IQueryInfos
) => {
    try {
        const treeId = deps.utils.getLibraryTreeId(filesLibraryId);
        const parentNode = parentRecord
            ? (
                  await deps.treeDomain.getNodesByRecord({
                      treeId,
                      record: {id: parentRecord.id, library: parentRecord.library},
                      ctx
                  })
              )[0]
            : null;

        await deps.treeDomain.addElement({
            treeId,
            element: {
                id: record.id,
                library: record.library
            },
            parent: parentNode,
            ctx
        });
    } catch (e) {
        deps.logger.error(
            `[${ctx.queryId}] Error on tree element creation, record id: ${record.id}, error: ${e.message}`
        );
        deps.logger.error(`[${ctx.queryId}] ${e.stack}`);
    }
};

export const deleteFilesTreeElement = async (
    recordId: string,
    filesLibraryId: string,
    recordLibrary: string,
    deps: IHandleFileSystemEventDeps,
    ctx
) => {
    try {
        const treeId = deps.utils.getLibraryTreeId(filesLibraryId);
        const recordNode = (
            await deps.treeDomain.getNodesByRecord({
                treeId,
                record: {id: recordId, library: recordLibrary},
                ctx
            })
        )[0];

        await deps.treeDomain.deleteElement({
            treeId,
            nodeId: recordNode,
            deleteChildren: true,
            ctx
        });
    } catch (e) {
        deps.logger.warn(
            `[${ctx.queryId}] Error on tree element deletion, record id: ${recordId}, error: ${e.message}`
        );
        deps.logger.error(`[${ctx.queryId}] ${e.stack}`);
    }
};

export const getPreviewsDefaultData = (previewVersions: ILibrary['previewsSettings']) => {
    const previewsStatus: IPreviewsStatus = {};
    const previews: IPreviews = {};

    previewVersions.forEach(previewSettings => {
        previewSettings.versions.sizes.forEach(size => {
            // previewsStatus default value
            previewsStatus[size.name] = {
                status: -1,
                message: 'waiting for creation'
            };

            // previews default value
            previews[size.name] = '';
        });

        if (previewSettings.versions.pdf) {
            previewsStatus.pdf = {
                status: -1,
                message: 'waiting for creation'
            };
            previews.pdf = '';
        }
    });

    return {
        previewsStatus,
        previews
    };
};
