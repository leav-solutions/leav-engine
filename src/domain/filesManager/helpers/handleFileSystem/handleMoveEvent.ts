// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {join} from 'path';
import {IFileEventData, IFilesAttributes} from '../../../../_types/filesManager';
import {IHandleFileSystemDeps, IHandleFileSystemResources} from '../handleFileSystem';
import {deleteFilesTreeElement, getInputData, getRecord, updateRecordFile} from '../handleFileUtilsHelper';
import {IQueryInfos} from '_types/queryInfos';

export const handleMoveEvent = async (
    scanMsg: IFileEventData,
    {library}: IHandleFileSystemResources,
    deps: IHandleFileSystemDeps,
    ctx: IQueryInfos
) => {
    const {fileName: fileNameDest, filePath: filePathDest} = getInputData(scanMsg.pathAfter);
    const {fileName: fileNameOrigin, filePath: filePathOrigin} = getInputData(scanMsg.pathBefore);
    const {userId} = deps.config.filesManager;

    // Find the destination record
    const destRecord = await getRecord(fileNameDest, filePathDest, library, false, deps, ctx);

    // Find the origin record
    const originRecord = await getRecord(fileNameOrigin, filePathOrigin, library, false, deps, ctx);

    // Update the origin record
    if (!originRecord) {
        deps.logger.warn(`[FilesManager] event ${scanMsg.event}, record origin not found : ${scanMsg.pathBefore}`);
        return false;
    }

    // Disable the destination record
    if (destRecord) {
        await deps.recordDomain.deactivateRecord(destRecord, {userId});
        await deleteFilesTreeElement(destRecord.id, library, deps, ctx);
    }

    const recordData: IFilesAttributes = {
        ROOT_KEY: scanMsg.rootKey,
        FILE_PATH: filePathDest,
        FILE_NAME: fileNameDest
    };

    await updateRecordFile(recordData, originRecord.id, library, deps, ctx);

    // Find parent record destination
    const parentPathList = filePathDest.split('/');
    const parentName = parentPathList.pop();

    // use getRecordParent, ignore disable
    const parentRecord = await getRecord(parentName, join(...parentPathList), library, false, deps, ctx);

    // Move element in the tree
    const parentTreeElement = parentRecord
        ? {
              id: parentRecord.id,
              library
          }
        : null;

    try {
        await deps.treeDomain.moveElement({
            treeId: deps.utils.getLibraryTreeId(library),
            element: {
                id: originRecord.id,
                library
            },
            parentTo: parentTreeElement,
            ctx
        });
    } catch (e) {
        deps.logger.warn(`[FilesManager] event ${scanMsg.event}, move element in tree fail : ${originRecord.id}`);
    }
};
