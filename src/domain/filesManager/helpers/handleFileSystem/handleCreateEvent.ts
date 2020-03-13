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
    deps: IHandleFileSystemDeps
) => {
    const {filePath, fileName} = getInputData(scanMsg.pathAfter);

    // Search for existing record
    let record = await getRecord(fileName, filePath, resources.library, true, deps);

    // Preview and Previews status
    const {previewsStatus, previews} = getPreviewsDatas(deps.previewVersions);

    if (record) {
        const {userId} = deps.config.filesManager;

        const recordData: IFilesAttributes = {
            ROOT_KEY: scanMsg.rootKey,
            INODE: scanMsg.inode,
            PREVIEWS_STATUS: previewsStatus,
            PREVIEWS: previews
        };

        await updateRecordFile(recordData, record.id, resources.library, deps);

        try {
            await deps.recordDomain.activateRecord(record, {userId});
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
            PREVIEWS_STATUS: previewsStatus,
            PREVIEWS: previews
        };

        try {
            record = await createRecordFile(recordData, resources.library, deps);
        } catch (e) {
            deps.logger.warn(`[FilesManager] Event ${scanMsg.event} - Error when create the record: ${e.message}`);
        }
    }

    // Find the parent folder
    const parentRecords = await getParentRecord(filePath, resources.library, deps);

    // Link the child to his parent in the tree
    await createFilesTreeElement(record, parentRecords, resources.library, deps);

    // Create the previews
    if (!scanMsg.isDirectory) {
        await createPreview(record, scanMsg, resources.library, deps.previewVersions, deps.amqpManager, deps.config);
    }
};
