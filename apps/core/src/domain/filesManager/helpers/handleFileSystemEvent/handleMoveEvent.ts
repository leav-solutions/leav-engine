// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {FilesAttributes, IFileEventData, IFileMetadata} from '../../../../_types/filesManager';
import {
    deleteFilesTreeElement,
    getInputData,
    getParentRecord,
    getRecord,
    updateRecordFile
} from '../handleFileUtilsHelper';
import {IHandleFileSystemEventDeps, IHandleFileSystemEventResources} from './_types';

export const handleMoveEvent = async (
    scanMsg: IFileEventData,
    {library}: IHandleFileSystemEventResources,
    deps: IHandleFileSystemEventDeps,
    ctx: IQueryInfos
) => {
    const {fileName: fileNameDest, filePath: filePathDest} = getInputData(scanMsg.pathAfter);
    const {fileName: fileNameOrigin, filePath: filePathOrigin} = getInputData(scanMsg.pathBefore);

    const directoriesLibraryId = deps.utils.getDirectoriesLibraryId(library);
    const filesLibraryId = library;
    const recordLibrary = scanMsg.isDirectory ? directoriesLibraryId : filesLibraryId;
    const recordId = scanMsg.recordId;

    // Find the origin record
    const originRecord = await getRecord(
        {fileName: fileNameOrigin, filePath: filePathOrigin, fileInode: scanMsg.inode},
        {recordLibrary, recordId},
        false,
        deps,
        ctx
    );

    // Update the origin record
    if (!originRecord) {
        deps.logger.error(`[${ctx.queryId}] event ${scanMsg.event}, origin record not found : ${scanMsg.pathBefore}`);
        return false;
    }

    // Find the destination record
    const destRecord = await getRecord(
        {fileName: fileNameDest, filePath: filePathDest},
        {recordLibrary},
        false,
        deps,
        ctx
    );

    // If destination record already exists, disable it.
    // We check difference between destination and origin ids to avoid error due to a
    // move, only in a tree, of the origin file (file path attribute is not updated in this case),
    // but this should be allowed!
    if (destRecord?.id && destRecord.id !== originRecord.id) {
        await deps.recordDomain.deactivateRecord(destRecord, ctx);
        await deleteFilesTreeElement(destRecord.id, filesLibraryId, recordLibrary, deps, ctx);
    }

    const recordData: IFileMetadata = {
        [FilesAttributes.ROOT_KEY]: scanMsg.rootKey,
        [FilesAttributes.FILE_PATH]: filePathDest,
        [FilesAttributes.FILE_NAME]: fileNameDest
    };
    await updateRecordFile(recordData, originRecord.id!, recordLibrary, deps, ctx);
    // Find parent record destination
    if (filePathDest !== filePathOrigin) {
        try {
            const treeId = deps.utils.getLibraryTreeId(filesLibraryId);

            const recordNode =
                originRecord.id && originRecord.library
                    ? (
                          await deps.treeDomain.getNodesByRecord({
                              treeId,
                              record: {id: originRecord.id, library: originRecord.library},
                              ctx
                          })
                      )[0]
                    : null;

            if (!recordNode) {
                throw new Error('Record node not found');
            }

            // use getRecordParent, ignore disable
            const parentRecord = await getParentRecord(filePathDest, directoriesLibraryId, deps, ctx);
            // Move element in the tree
            const parentNode =
                parentRecord && parentRecord.id && parentRecord.library
                    ? (
                          await deps.treeDomain.getNodesByRecord({
                              treeId,
                              record: {id: parentRecord.id, library: parentRecord.library},
                              ctx
                          })
                      )[0]
                    : null;
            if (filePathDest && filePathDest !== '.' && !parentNode) {
                throw new Error('Parent not found');
            }

            await deps.treeDomain.moveElement({
                treeId: deps.utils.getLibraryTreeId(library),
                nodeId: recordNode,
                parentTo: parentNode,
                ctx,
                skipChecks: true
            });
        } catch (e) {
            deps.logger.error(
                `[${ctx.queryId}] event ${scanMsg.event}, move element in tree fail : ${originRecord.id}. ${e.message}`
            );
            deps.logger.error(`[${ctx.queryId}] ${e.stack}`);
        }
    }
};
