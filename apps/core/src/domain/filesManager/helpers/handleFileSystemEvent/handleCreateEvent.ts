import {type IQueryInfos} from '../../../../_types/queryInfos';
import {FilesAttributes, type IFileEventData, type IFileMetadata} from '../../../../_types/filesManager';
import {systemPreviewsSettings} from '../../_constants';
import {extractFileMetadata} from '../extractFileMetadata';
import {
    createFilesTreeElement,
    createRecordFile,
    getInputData,
    getParentRecord,
    getPreviewsDefaultData,
    getRecord,
    updateRecordFile,
} from '../handleFileUtilsHelper';
import {requestPreviewGeneration} from '../handlePreview';
import {type IHandleFileSystemEventDeps, type IHandleFileSystemEventResources} from './_types';

export const handleCreateEvent = async (
    scanMsg: IFileEventData,
    resources: IHandleFileSystemEventResources,
    deps: IHandleFileSystemEventDeps,
    ctx: IQueryInfos,
): Promise<void> => {
    const pathAfter = scanMsg.pathAfter ?? '';
    const {filePath, fileName} = getInputData(pathAfter);

    // Search for existing record
    const directoriesLibraryId = deps.utils.getDirectoriesLibraryId(resources.library);
    const filesLibraryId = resources.library;
    const recordLibrary = scanMsg.isDirectory ? directoriesLibraryId : filesLibraryId;
    const recordLibraryProps = await deps.libraryDomain.getLibraryProperties(recordLibrary, ctx);

    let record = await getRecord({fileName, filePath, fileInode: scanMsg.inode}, {recordLibrary}, true, deps, ctx);

    // Preview and Previews status
    const {previewsStatus, previews} = getPreviewsDefaultData(systemPreviewsSettings);

    const fileMetadata = !scanMsg.isDirectory
        ? await extractFileMetadata(pathAfter, scanMsg.rootKey, deps.config)
        : null;

    if (record) {
        try {
            await deps.recordDomain.activateRecord(record, ctx);

            const recordData: IFileMetadata = {
                [FilesAttributes.ROOT_KEY]: scanMsg.rootKey,
                [FilesAttributes.INODE]: scanMsg.inode,
                [deps.utils.getPreviewsStatusAttributeName(filesLibraryId)]: previewsStatus,
                [deps.utils.getPreviewsAttributeName(filesLibraryId)]: previews,
                [FilesAttributes.HASH]: scanMsg.hash,
                ...fileMetadata,
            };
            await updateRecordFile(recordData, record.id!, recordLibrary, deps, ctx);
        } catch (e) {
            deps.logger.error(`[FilesManager] Event ${scanMsg.event} - Error on record activation : ${e.stack}`);
        }
    } else {
        const recordData: IFileMetadata = {
            [FilesAttributes.ROOT_KEY]: scanMsg.rootKey,
            [FilesAttributes.FILE_PATH]: filePath,
            [FilesAttributes.FILE_NAME]: fileName,
            [FilesAttributes.INODE]: scanMsg.inode,
            [FilesAttributes.HASH]: scanMsg.hash,
            [deps.utils.getPreviewsStatusAttributeName(filesLibraryId)]: previewsStatus,
            [deps.utils.getPreviewsAttributeName(filesLibraryId)]: previews,
            ...fileMetadata,
        };

        try {
            record = await createRecordFile(recordData, recordLibrary, deps, ctx);
        } catch (e) {
            deps.logger.error(`[${ctx.queryId}] Event ${scanMsg.event} - Error on record creation: ${e.stack}`);
        }
    }

    // Find the parent folder
    const parentRecords = await getParentRecord(filePath, directoriesLibraryId, deps, ctx);

    // Link the child to his parent in the tree
    await createFilesTreeElement(record!, parentRecords, filesLibraryId, deps, ctx);

    // Create the previews
    if (!scanMsg.isDirectory) {
        await requestPreviewGeneration({
            recordId: record!.id!,
            pathAfter,
            libraryId: recordLibrary,
            versions: deps.utils.previewsSettingsToVersions(recordLibraryProps.previewsSettings ?? []),
            deps: {...deps},
        });
    }
};
