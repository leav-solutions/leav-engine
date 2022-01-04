// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
import {IQueryInfos} from '_types/queryInfos';

export const handleCreateEvent = async (
    scanMsg: IFileEventData,
    resources: IHandleFileSystemResources,
    deps: IHandleFileSystemDeps,
    ctx: IQueryInfos
) => {
    const {filePath, fileName} = getInputData(scanMsg.pathAfter);

    // Search for existing record
    let record = await getRecord(fileName, filePath, resources.library, true, deps, ctx);

    // Preview and Previews status
    const {previewsStatus, previews} = getPreviewsDatas(deps.previewVersions);

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

            await updateRecordFile(recordData, record.id, resources.library, deps, ctx);
        } catch (e) {
            deps.logger.warn(`[FilesManager] Event ${scanMsg.event} - Error when activate record : ${e.message}`);
        }
    } else {
        const recordData: IFilesAttributes = {
            ROOT_KEY: scanMsg.rootKey,
            FILE_PATH: filePath,
            FILE_NAME: fileName,
            INODE: scanMsg.inode,
            IS_DIRECTORY: scanMsg.isDirectory,
            HASH: scanMsg.hash,
            PREVIEWS_STATUS: previewsStatus,
            PREVIEWS: previews
        };

        try {
            record = await createRecordFile(recordData, resources.library, deps, ctx);
        } catch (e) {
            deps.logger.warn(`[FilesManager] Event ${scanMsg.event} - Error when create the record: ${e.message}`);
        }
    }

    // Find the parent folder
    const parentRecords = await getParentRecord(filePath, resources.library, deps, ctx);

    // Link the child to his parent in the tree
    await createFilesTreeElement(record, parentRecords, resources.library, deps, ctx);

    // Create the previews
    if (!scanMsg.isDirectory) {
        await createPreview(
            record.id,
            scanMsg.pathAfter,
            resources.library,
            deps.previewVersions,
            deps.amqpService,
            deps.config
        );
    }
};
