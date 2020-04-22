import {IFileEventData, IFilesAttributes} from '../../../../_types/filesManager';
import {IHandleFileSystemDeps, IHandleFileSystemResources} from '../handleFileSystem';
import {getInputData, getPreviewsDatas, getRecord, updateRecordFile} from '../handleFileUtilsHelper';
import {createPreview} from '../handlePreview';
import {IQueryInfos} from '_types/queryInfos';

export const handleUpdateEvent = async (
    scanMsg: IFileEventData,
    {library}: IHandleFileSystemResources,
    deps: IHandleFileSystemDeps,
    ctx: IQueryInfos
) => {
    const {fileName, filePath} = getInputData(scanMsg.pathAfter);

    // Get the records
    const record = await getRecord(fileName, filePath, library, false, deps, ctx);

    if (!record) {
        deps.logger.warn(`[FilesManager] event ${scanMsg.event} - record not found : ${scanMsg.pathAfter}`);
        return false;
    }

    const {previewsStatus, previews} = getPreviewsDatas(deps.previewVersions);

    const recordData: IFilesAttributes = {
        INODE: scanMsg.inode,
        ROOT_KEY: scanMsg.rootKey,
        HASH: scanMsg.hash,
        PREVIEWS_STATUS: previewsStatus,
        PREVIEWS: previews
    };

    // Update datas
    updateRecordFile(recordData, record.id, library, deps, ctx);

    // Regenerate Previews
    createPreview(record, scanMsg, library, deps.previewVersions, deps.amqpManager, deps.config);
};
