// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {IFileEventData} from '../../../../_types/filesManager';
import {deleteFilesTreeElement, getInputData, getRecord} from '../handleFileUtilsHelper';
import {IHandleFileSystemEventDeps, IHandleFileSystemEventResources} from './_types';

export const handleRemoveEvent = async (
    scanMsg: IFileEventData,
    {library}: IHandleFileSystemEventResources,
    deps: IHandleFileSystemEventDeps,
    ctx: IQueryInfos
) => {
    const {filePath, fileName} = getInputData(scanMsg.pathBefore);
    const {userId} = deps.config.filesManager;

    const directoriesLibraryId = deps.utils.getDirectoriesLibraryId(library);
    const filesLibraryId = library;
    const recordLibrary = scanMsg.isDirectory ? directoriesLibraryId : filesLibraryId;
    const recordId = scanMsg.recordId;

    const record = await getRecord(
        {fileName, filePath, fileInode: scanMsg.inode},
        {recordLibrary, recordId},
        false,
        deps,
        ctx
    );

    if (!record) {
        deps.logger.error(
            `[${ctx.queryId}] Event ${scanMsg.event} - Can't find the record to disable - file: ${scanMsg.pathBefore}`
        );
        return false;
    }

    // First, remove the record from the tree, then deactivate the record.
    // If we start by deactivating the record and something goes wrong when removing it from the tree, the record
    // won't be found on the next attempt to remove it (eg. triggered by sync scan). The only way to fix this would be
    // to reactivate it in DB
    if (record.id) {
        await deleteFilesTreeElement(record.id, filesLibraryId, recordLibrary, deps, ctx);
    } else {
        deps.logger.error('[FilesManager] No record id found when trying to remove the record');
    }

    // Deactivate the record
    try {
        await deps.recordDomain.deactivateRecord(record, {userId});
    } catch (e) {
        deps.logger.warn(`[FilesManager] Error when deactivating the record: ${record.id}`);
    }

    return true;
};
