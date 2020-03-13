import {IFileEventData} from '../../../../_types/filesManager';
import {IHandleFileSystemDeps, IHandleFileSystemResources} from '../handleFileSystem';
import {deleteFilesTreeElement, getInputData, getRecord} from '../handleFileUtilsHelper';

export const handleRemoveEvent = async (
    scanMsg: IFileEventData,
    {library}: IHandleFileSystemResources,
    deps: IHandleFileSystemDeps
) => {
    const {filePath, fileName} = getInputData(scanMsg.pathBefore);
    const {userId} = deps.config.filesManager;

    const record = await getRecord(fileName, filePath, library, false, deps);

    if (!record) {
        deps.logger.warn(
            `[FilesManager] Event ${scanMsg.event} - Can't find the record to disable - file: ${scanMsg.pathBefore}`
        );
        return false;
    }

    // Deactivate the record
    try {
        await deps.recordDomain.deactivateRecord(record, {userId});
    } catch (e) {
        deps.logger.warn(`[FilesManager] Error when deactivate the record: ${record.id}`);
    }

    await deleteFilesTreeElement(record.id, library, deps);

    return true;
};
