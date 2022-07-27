// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
import {AttributeCondition, IRecord, Operator} from '../../../_types/record';
import {IHandleFileSystemDeps} from './handleFileSystem';
import winston = require('winston');

interface IGetRecord {
    recordDomain: IRecordDomain;
    config: Config.IConfig;
    logger: winston.Winston;
}

export const getRecord = async (
    {fileName, filePath, fileInode}: {fileName: string; filePath: string; fileInode?: number},
    {recordLibrary, recordId}: {recordLibrary: string; recordId?: string},
    retrieveInactive: boolean,
    deps: IGetRecord,
    ctx: IQueryInfos
): Promise<IRecord> => {
    let recordsFind: IListWithCursor<IRecord>;

    try {
        const filters = [];

        if (typeof recordId !== 'undefined') {
            filters.push({
                field: 'id',
                condition: AttributeCondition.EQUAL,
                value: recordId
            });
        } else {
            filters.push(
                ...(!!fileInode
                    ? [
                          {
                              field: FilesAttributes.INODE,
                              condition: AttributeCondition.EQUAL,
                              value: String(fileInode)
                          },
                          {operator: Operator.OR}
                      ]
                    : []),
                {operator: Operator.OPEN_BRACKET},
                {field: FilesAttributes.FILE_NAME, condition: AttributeCondition.EQUAL, value: fileName},
                {operator: Operator.AND},
                {field: FilesAttributes.FILE_PATH, condition: AttributeCondition.EQUAL, value: filePath},
                {operator: Operator.CLOSE_BRACKET}
            );
        }

        recordsFind = await deps.recordDomain.find({
            params: {
                library: recordLibrary,
                filters,
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
                {field: FilesAttributes.FILE_NAME, condition: AttributeCondition.EQUAL, value: parentName},
                {operator: Operator.AND},
                {field: FilesAttributes.FILE_PATH, condition: AttributeCondition.EQUAL, value: join(...parentPath)}
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
            await deps.valueDomain.saveValueBatch({
                library,
                recordId: newRecord.id,
                values,
                ctx
            });
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
    // Update record file attributes
    const values: IValue[] = Object.keys(recordData).map(key => ({
        attribute: FilesAttributes[key],
        value: typeof recordData[key] === 'object' ? JSON.stringify(recordData[key]) : recordData[key]
    }));

    try {
        const res = await deps.valueDomain.saveValueBatch({
            library,
            recordId,
            values,
            ctx
        });

        if (res.errors) {
            throw new Error(res.errors.map(err => `${err.attribute}: ${err.message}`).join(', '));
        }
    } catch (e) {
        deps.logger.warn(`[${ctx.queryId}] Error when updating record: ${recordId}, ${e.message}`);
        deps.logger.warn(`[${ctx.queryId}] ${e.stack}`);
    }
};

export const getInputData = (input: string) => {
    const filePath = dirname(input);
    const fileName = basename(input);

    return {filePath, fileName};
};

export const createFilesTreeElement = async (
    record: IRecord,
    parentRecord: IRecord,
    filesLibraryId: string,
    deps: IHandleFileSystemDeps,
    ctx: IQueryInfos
) => {
    try {
        const treeId = deps.utils.getLibraryTreeId(filesLibraryId);
        const parentNode = parentRecord
            ? (
                  await deps.treeDomain.getNodesByRecord({
                      treeId,
                      record: {id: parentRecord.id, library: parentRecord.library},
                      ctx
                  })
              )[0]
            : null;

        await deps.treeDomain.addElement({
            treeId,
            element: {
                id: record.id,
                library: record.library
            },
            parent: parentNode,
            ctx
        });
    } catch (e) {
        deps.logger.error(
            `[${ctx.queryId}] Error on tree element creation, record id: ${record.id}, error: ${e.message}`
        );
        deps.logger.error(`[${ctx.queryId}] ${e.stack}`);
    }
};

export const deleteFilesTreeElement = async (
    recordId: string,
    filesLibraryId: string,
    recordLibrary: string,
    deps: IHandleFileSystemDeps,
    ctx
) => {
    try {
        const treeId = deps.utils.getLibraryTreeId(filesLibraryId);
        const recordNode = (
            await deps.treeDomain.getNodesByRecord({
                treeId,
                record: {id: recordId, library: recordLibrary},
                ctx
            })
        )[0];

        await deps.treeDomain.deleteElement({
            treeId,
            nodeId: recordNode,
            deleteChildren: true,
            ctx
        });
    } catch (e) {
        deps.logger.warn(
            `[${ctx.queryId}] Error on tree element deletion, record id: ${recordId}, error: ${e.message}`
        );
        deps.logger.error(`[${ctx.queryId}] ${e.stack}`);
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
                message: 'waiting for creation'
            };

            // previews default value
            previews[size.name] = '';
        })
    );

    if (previewVersions.some(version => version.pdf)) {
        previewsStatus.pdf = {
            status: -1,
            message: 'waiting for creation'
        };
        previews.pdf = '';
    }

    return {
        previewsStatus,
        previews
    };
};
