import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {basename, dirname, join} from 'path';
import * as Config from '_types/config';
import {IListWithCursor} from '_types/list';
import {IValue} from '_types/value';
import {
    FilesAttributes,
    IFilesAttributes,
    IPreviews,
    IPreviewsStatus,
    IPreviewVersion
} from '../../../_types/filesManager';
import {IRecord} from '../../../_types/record';
import {IHandleFileSystemDeps} from './handleFileSystem';
import winston = require('winston');

interface IGetRecord {
    recordDomain: IRecordDomain;
    config: Config.IConfig;
    logger: winston.Winston;
}

export const getRecord = async (
    fileName: string,
    filePath: string,
    library: string,
    retrieveInactive: boolean,
    deps: IGetRecord
): Promise<IRecord> => {
    let recordsFind: IListWithCursor<IRecord>;

    try {
        recordsFind = await deps.recordDomain.find({
            library,
            filters: {
                [FilesAttributes.FILE_NAME]: fileName,
                [FilesAttributes.FILE_PATH]: filePath
            },
            retrieveInactive
        });
    } catch (e) {
        deps.logger.warn(`[FilesManager] Error when search record : ${join(filePath, fileName)}`);
        return;
    }

    if (recordsFind.totalCount === 0) {
        deps.logger.warn(`[FilesManager] no record find using fileName and filePath: ${filePath} ${fileName}`);
        return;
    }

    if (recordsFind.totalCount > 1) {
        deps.logger.warn(
            `[FilesManager] Multiple record find using fileName and filePath: ${recordsFind.list.toString()}`
        );
    }

    return recordsFind.list[0];
};

export const getParentRecord = async (
    fullParentPath: string,
    library: string,
    deps: IHandleFileSystemDeps
): Promise<IRecord | null> => {
    const parentPath = fullParentPath.split('/');
    const parentName = parentPath.pop();

    const folderParent = await deps.recordDomain.find({
        library,
        filters: {
            [FilesAttributes.FILE_NAME]: parentName,
            [FilesAttributes.FILE_PATH]: join(...parentPath)
        }
    });

    const parent = folderParent.list[0] ?? null;

    return parent;
};

export const createRecordFile = async (recordData: IFilesAttributes, library: string, deps: IHandleFileSystemDeps) => {
    const {userId} = deps.config.filesManager;
    let newRecord: IRecord;

    try {
        newRecord = await deps.recordDomain.createRecord(library, {userId});
    } catch (e) {
        deps.logger.warn(`[FilesManager] Error when create new record : ${e.message}`);
    }

    if (newRecord.id) {
        const values: IValue[] = Object.keys(recordData).map(key => ({
            attribute: FilesAttributes[key],
            value: recordData[key]
        }));

        try {
            const responses = await deps.valueDomain.saveValueBatch(library, newRecord.id, values, {userId});
            // check error in responses
        } catch (e) {
            deps.logger.warn(`[FilesManager] Error when save values for new record : ${newRecord.id}`);
        }
    }

    return newRecord;
};

export const updateRecordFile = async (
    recordData: IFilesAttributes,
    recordId: number,
    library: string,
    deps: {
        valueDomain: IValueDomain;
        config: Config.IConfig;
        logger: winston.Winston;
    }
) => {
    const {userId} = deps.config.filesManager;

    // Update record file attributes
    const values: IValue[] = Object.keys(recordData).map(key => ({
        attribute: FilesAttributes[key],
        value: recordData[key]
    }));

    try {
        await deps.valueDomain.saveValueBatch(library, recordId, values, {userId});
    } catch (e) {
        deps.logger.warn(`[FilesManager] Error when update record: ${recordId}`);
    }
};

export const getInputData = (input: string) => {
    const filePath = dirname(input);
    const fileName = basename(input);

    return {filePath, fileName};
};

export const createFilesTreeElement = async (
    record: IRecord,
    parentRecords: IRecord,
    library: string,
    deps: IHandleFileSystemDeps
) => {
    const parentTreeElement = parentRecords
        ? {
              id: parentRecords.id,
              library
          }
        : null;

    try {
        await deps.treeDomain.addElement(
            deps.utils.getLibraryTreeId(library),
            {
                id: record.id,
                library
            },
            parentTreeElement
        );
    } catch (e) {
        deps.logger.warn(`[FilesManager] Error when create tree element, record id: ${record.id}`);
    }
};

export const deleteFilesTreeElement = async (recordId: number, library: string, deps: IHandleFileSystemDeps) => {
    try {
        await deps.treeDomain.deleteElement(
            deps.utils.getLibraryTreeId(library),
            {
                id: recordId,
                library
            },
            true
        );
    } catch (e) {
        deps.logger.warn(`[FilesManager] Error when delete element from tree: ${recordId}`);
    }
};

export const getPreviewsDatas = (previewVersions: IPreviewVersion[]) => {
    const previewsStatus: IPreviewsStatus = {};
    const previews: IPreviews = {};

    previewVersions.forEach(version =>
        version.sizes.forEach(size => {
            // previewsStatus default value
            previewsStatus[size.name] = {
                status: -1,
                message: 'wait for creation'
            };

            // previews default value
            previews[size.name] = '';
        })
    );

    // pages default value
    previewsStatus.pages = {
        status: -1,
        message: 'wait for creation'
    };

    previews.pages = '';

    return {
        previewsStatus,
        previews
    };
};
