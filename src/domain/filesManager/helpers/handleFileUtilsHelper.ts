import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {basename, dirname, join} from 'path';
import * as Config from '_types/config';
import {IListWithCursor} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IValue} from '_types/value';
import {
    FilesAttributes,
    IFilesAttributes,
    IPreviews,
    IPreviewsStatus,
    IPreviewVersion
} from '../../../_types/filesManager';
import {IRecord, Operator} from '../../../_types/record';
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
    deps: IGetRecord,
    ctx: IQueryInfos
): Promise<IRecord> => {
    let recordsFind: IListWithCursor<IRecord>;

    try {
        recordsFind = await deps.recordDomain.find({
            params: {
                library,
                filters: [
                    {field: FilesAttributes.FILE_NAME, value: fileName},
                    {operator: Operator.AND},
                    {field: FilesAttributes.FILE_PATH, value: filePath}
                ],
                retrieveInactive
            },
            ctx
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
    deps: IHandleFileSystemDeps,
    ctx: IQueryInfos
): Promise<IRecord | null> => {
    const parentPath = fullParentPath.split('/');
    const parentName = parentPath.pop();

    const folderParent = await deps.recordDomain.find({
        params: {
            library,
            filters: [
                {field: FilesAttributes.FILE_NAME, value: parentName},
                {operator: Operator.AND},
                {field: FilesAttributes.FILE_PATH, value: join(...parentPath)}
            ]
        },
        ctx
    });

    const parent = folderParent.list[0] ?? null;

    return parent;
};

export const createRecordFile = async (
    recordData: IFilesAttributes,
    library: string,
    deps: IHandleFileSystemDeps,
    ctx: IQueryInfos
) => {
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
            value: typeof recordData[key] === 'object' ? JSON.stringify(recordData[key]) : recordData[key]
        }));

        try {
            const responses = await deps.valueDomain.saveValueBatch({
                library,
                recordId: newRecord.id,
                values,
                ctx
            });
            // check error in responses
        } catch (e) {
            deps.logger.warn(`[FilesManager] Error when save values for new record : ${newRecord.id}`);
        }
    }

    return newRecord;
};

export const updateRecordFile = async (
    recordData: IFilesAttributes,
    recordId: string,
    library: string,
    deps: {
        valueDomain: IValueDomain;
        config: Config.IConfig;
        logger: winston.Winston;
    },
    ctx: IQueryInfos
) => {
    const {userId} = deps.config.filesManager;

    // Update record file attributes
    const values: IValue[] = Object.keys(recordData).map(key => ({
        attribute: FilesAttributes[key],
        value: typeof recordData[key] === 'object' ? JSON.stringify(recordData[key]) : recordData[key]
    }));

    try {
        await deps.valueDomain.saveValueBatch({
            library,
            recordId,
            values,
            ctx
        });
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
    deps: IHandleFileSystemDeps,
    ctx: IQueryInfos
) => {
    const parentTreeElement = parentRecords
        ? {
              id: parentRecords.id,
              library
          }
        : null;

    try {
        await deps.treeDomain.addElement({
            treeId: deps.utils.getLibraryTreeId(library),
            element: {
                id: record.id,
                library
            },
            parent: parentTreeElement,
            ctx
        });
    } catch (e) {
        deps.logger.warn(`[FilesManager] Error when create tree element, record id: ${record.id}`);
    }
};

export const deleteFilesTreeElement = async (recordId: string, library: string, deps: IHandleFileSystemDeps, ctx) => {
    try {
        await deps.treeDomain.deleteElement({
            treeId: deps.utils.getLibraryTreeId(library),
            element: {
                id: recordId,
                library
            },
            deleteChildren: true,
            ctx
        });
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
