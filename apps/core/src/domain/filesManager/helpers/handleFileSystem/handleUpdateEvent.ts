// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {systemPreviewVersions} from '../../../../domain/filesManager/_constants';
import {IFileEventData, IFilesAttributes} from '../../../../_types/filesManager';
import {IHandleFileSystemDeps, IHandleFileSystemResources} from '../handleFileSystem';
import {getInputData, getPreviewsDefaultData, getRecord, updateRecordFile} from '../handleFileUtilsHelper';
import {requestPreviewGeneration} from '../handlePreview';

export const handleUpdateEvent = async (
    scanMsg: IFileEventData,
    {library}: IHandleFileSystemResources,
    deps: IHandleFileSystemDeps,
    ctx: IQueryInfos
): Promise<void> => {
    const {fileName, filePath} = getInputData(scanMsg.pathAfter);

    const directoriesLibraryId = deps.utils.getDirectoriesLibraryId(library);
    const filesLibraryId = library;
    const recordLibrary = scanMsg.isDirectory ? directoriesLibraryId : filesLibraryId;
    const recordId = scanMsg.recordId;

    // Get the records
    const record = await getRecord(
        {fileName, filePath, fileInode: scanMsg.inode},
        {recordLibrary, recordId},
        false,
        deps,
        ctx
    );

    if (!record) {
        deps.logger.warn(`[FilesManager] event ${scanMsg.event} - record not found : ${scanMsg.pathAfter}`);
        return;
    }

    const {previewsStatus, previews} = getPreviewsDefaultData(systemPreviewVersions);

    const recordData: IFilesAttributes = {
        INODE: scanMsg.inode,
        ROOT_KEY: scanMsg.rootKey,
        HASH: scanMsg.hash,
        PREVIEWS_STATUS: previewsStatus,
        PREVIEWS: previews
    };

    // Update datas
    await updateRecordFile(recordData, record.id, library, deps, ctx);

    // Regenerate Previews
    await requestPreviewGeneration(
        record.id,
        scanMsg.pathAfter,
        library,
        systemPreviewVersions,
        deps.amqpService,
        deps.config
    );
};
