// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {systemPreviewVersions} from '../../../../domain/filesManager/_constants';
import {IFileEventData, IFilesAttributes} from '../../../../_types/filesManager';
import {IHandleFileSystemDeps, IHandleFileSystemResources} from '../handleFileSystem';
import {
    createFilesTreeElement,
    createRecordFile,
    getInputData,
    getParentRecord,
    getPreviewsDatas,
    getRecord,
    updateRecordFile
} from '../handleFileUtilsHelper';
import {createPreview} from '../handlePreview';

export const handleCreateEvent = async (
    scanMsg: IFileEventData,
    resources: IHandleFileSystemResources,
    deps: IHandleFileSystemDeps,
    ctx: IQueryInfos
) => {
    const {filePath, fileName} = getInputData(scanMsg.pathAfter);

    // Search for existing record
    const directoriesLibraryId = deps.utils.getDirectoriesLibraryId(resources.library);
    const filesLibraryId = resources.library;
    const recordLibrary = scanMsg.isDirectory ? directoriesLibraryId : filesLibraryId;

    let record = await getRecord({fileName, filePath, fileInode: scanMsg.inode}, {recordLibrary}, true, deps, ctx);

    // Preview and Previews status
    const {previewsStatus, previews} = getPreviewsDatas(systemPreviewVersions);

    if (record) {
        try {
            const {userId} = deps.config.filesManager;

            await deps.recordDomain.activateRecord(record, {userId});

            const recordData: IFilesAttributes = {
                ROOT_KEY: scanMsg.rootKey,
                INODE: scanMsg.inode,
                PREVIEWS_STATUS: previewsStatus,
                PREVIEWS: previews,
                HASH: scanMsg.hash
            };

            await updateRecordFile(recordData, record.id, recordLibrary, deps, ctx);
        } catch (e) {
            deps.logger.error(`[FilesManager] Event ${scanMsg.event} - Error on record activation : ${e.message}`);
        }
    } else {
        const recordData: IFilesAttributes = {
            ROOT_KEY: scanMsg.rootKey,
            FILE_PATH: filePath,
            FILE_NAME: fileName,
            INODE: scanMsg.inode,
            HASH: scanMsg.hash,
            PREVIEWS_STATUS: previewsStatus,
            PREVIEWS: previews
        };

        try {
            record = await createRecordFile(recordData, recordLibrary, deps, ctx);
        } catch (e) {
            deps.logger.error(`[${ctx.queryId}] Event ${scanMsg.event} - Error on record creation: ${e.message}`);
            deps.logger.error(`[${ctx.queryId}] ${e.stack}`);
        }
    }

    // Find the parent folder
    const parentRecords = await getParentRecord(filePath, directoriesLibraryId, deps, ctx);

    // Link the child to his parent in the tree
    await createFilesTreeElement(record, parentRecords, filesLibraryId, deps, ctx);

    // Create the previews
    if (!scanMsg.isDirectory) {
        await createPreview(
            record.id,
            scanMsg.pathAfter,
            recordLibrary,
            systemPreviewVersions,
            deps.amqpService,
            deps.config
        );
    }
};
