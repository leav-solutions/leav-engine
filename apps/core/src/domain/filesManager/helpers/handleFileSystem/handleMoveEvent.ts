// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {IFileEventData, IFilesAttributes} from '../../../../_types/filesManager';
import {IHandleFileSystemDeps, IHandleFileSystemResources} from '../handleFileSystem';
import {
    deleteFilesTreeElement,
    getInputData,
    getParentRecord,
    getRecord,
    updateRecordFile
} from '../handleFileUtilsHelper';

export const handleMoveEvent = async (
    scanMsg: IFileEventData,
    {library}: IHandleFileSystemResources,
    deps: IHandleFileSystemDeps,
    ctx: IQueryInfos
) => {
    const {fileName: fileNameDest, filePath: filePathDest} = getInputData(scanMsg.pathAfter);
    const {fileName: fileNameOrigin, filePath: filePathOrigin} = getInputData(scanMsg.pathBefore);

    const directoriesLibraryId = deps.utils.getDirectoriesLibraryId(library);
    const filesLibraryId = library;
    const recordLibrary = scanMsg.isDirectory ? directoriesLibraryId : filesLibraryId;

    // Find the destination record
    const destRecord = await getRecord(fileNameDest, filePathDest, recordLibrary, false, deps, ctx);

    // Find the origin record
    const originRecord = await getRecord(fileNameOrigin, filePathOrigin, recordLibrary, false, deps, ctx);

    // Update the origin record
    if (!originRecord) {
        deps.logger.error(`[${ctx.queryId}] event ${scanMsg.event}, origin record not found : ${scanMsg.pathBefore}`);
        return false;
    }

    // Destination record already exists, disable it
    if (destRecord) {
        await deps.recordDomain.deactivateRecord(destRecord, ctx);
        await deleteFilesTreeElement(destRecord.id, filesLibraryId, recordLibrary, deps, ctx);
    }

    const recordData: IFilesAttributes = {
        ROOT_KEY: scanMsg.rootKey,
        FILE_PATH: filePathDest,
        FILE_NAME: fileNameDest
    };

    await updateRecordFile(recordData, originRecord.id, recordLibrary, deps, ctx);

    // Find parent record destination
    try {
        const treeId = deps.utils.getLibraryTreeId(filesLibraryId);
        // use getRecordParent, ignore disable
        const parentRecord = await getParentRecord(filePathDest, directoriesLibraryId, deps, ctx);

        const recordNode = (
            await deps.treeDomain.getNodesByRecord({
                treeId,
                record: {id: originRecord.id, library: originRecord.library},
                ctx
            })
        )[0];

        if (!recordNode) {
            throw new Error('Record node not found');
        }

        // Move element in the tree
        const parentNode = parentRecord
            ? (
                  await deps.treeDomain.getNodesByRecord({
                      treeId,
                      record: {id: parentRecord.id, library: parentRecord.library},
                      ctx
                  })
              )[0]
            : null;

        if (filePathDest && !parentNode) {
            throw new Error('Parent not found');
        }

        await deps.treeDomain.moveElement({
            treeId: deps.utils.getLibraryTreeId(library),
            nodeId: recordNode,
            parentTo: parentNode,
            ctx
        });
    } catch (e) {
        deps.logger.error(
            `[${ctx.queryId}] event ${scanMsg.event}, move element in tree fail : ${originRecord.id}. ${e.message}`
        );
        deps.logger.error(`[${ctx.queryId}] ${e.stack}`);
    }
};
