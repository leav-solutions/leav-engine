// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {UpdateRecordLastModifFunc} from 'domain/helpers/updateRecordLastModif';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import {basename, dirname, join} from 'path';
import * as Config from '_types/config';
import {IListWithCursor} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {
    FilesAttributes,
    IFilesAttributes,
    IPreviews,
    IPreviewsStatus,
    IPreviewVersion
} from '../../../_types/filesManager';
import {AttributeCondition, IRecord, Operator} from '../../../_types/record';
import updateRecordLastModif from '../../value/helpers/updateRecordLastModif';
import {IHandleFileSystemDeps} from './handleFileSystem';
import winston = require('winston');
import { IDbService } from 'infra/db/dbService';
import { aql } from 'arangojs';
import { IDbUtils } from 'infra/db/dbUtils';
import { IDbDocument } from 'infra/db/_types';

interface IGetRecord {
    recordDomain: IRecordDomain;
    config: Config.IConfig;
    logger: winston.Winston;
    dbService: IDbService;
    dbUtils: IDbUtils
}

export const getRecord = async (
    {fileName, filePath, fileInode}: {fileName: string; filePath: string; fileInode?: number},
    {recordLibrary, recordId}: {recordLibrary: string; recordId?: string},
    retrieveInactive: boolean,
    deps: IGetRecord,
    ctx: IQueryInfos
): Promise<IRecord|null> => {
    let recordsFind: IListWithCursor<IRecord>;
    const coll = deps.dbService.db.collection(recordLibrary);

    const queryParts = [aql`FOR r in ${coll}`];
    let results: IDbDocument[];
    if (recordId) {
        queryParts.push(aql`FILTER (r.id == ${recordId})`);
    } else if (!!fileInode) {
        queryParts.push(aql`FILTER (r.${FilesAttributes.INODE} == ${fileInode} 
                OR (r.${FilesAttributes.FILE_PATH} == ${filePath} AND r.${FilesAttributes.FILE_NAME} == ${fileName})
            )`);
    } else {
        queryParts.push(aql`FILTER (r.${FilesAttributes.FILE_PATH} == ${filePath} 
                AND r.${FilesAttributes.FILE_NAME} == ${fileName}
            )`);
    }
    if (!retrieveInactive) {
        queryParts.push(aql`FILTER r.active == true`);
    }
    queryParts.push(aql`SORT r._key DESC`);
    queryParts.push(aql`RETURN MERGE(r, {library: ${recordLibrary}})`);
    const query  = aql.join(queryParts, '\n');

    try{
        results = await deps.dbService.execute({
            query,
            withTotalCount: false,
            ctx
        });
    } catch (e) {
        deps.logger.warn(`[FilesManager] Error when search record : ${join(filePath, fileName)}`);
        return null;
    }

    const count = results.length;
    if (count === 0) {
        return null;
    }

    if (count > 1) {
        deps.logger.warn(
            `[FilesManager] Multiple record find using fileName and filePath: ${recordsFind.list.toString()}`
        );
    }
    
    return deps.dbUtils.cleanup(results[0]);

};

export const getParentRecord = async (
    fullParentPath: string,
    library: string,
    deps: IHandleFileSystemDeps,
    ctx: IQueryInfos
): Promise<IRecord | null> => {
    let parentPath = fullParentPath.split('/');
    const parentName = parentPath.pop();

    if (parentPath.length === 0) {
        parentPath = ['.'];
    }

    const coll = deps.dbService.db.collection(library);
    const query = aql`FOR r in ${coll} FILTER (r.${FilesAttributes.FILE_NAME} == ${parentName} AND r.${FilesAttributes.FILE_PATH} == ${join(...parentPath)}) RETURN MERGE(r, {library: ${library}})`;
    let results: IDbDocument[];
    try{
        results = await deps.dbService.execute({
            query,
            withTotalCount: false,
            ctx
        });
    } catch (e) {
        deps.logger.warn(`[FilesManager] Error when search parent folder : ${fullParentPath}`);
        return null;
    }

    const parent = results[0] 
        ? deps.dbUtils.cleanup(results[0])
        : null;

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
        const dataToSave: IRecord = Object.keys(recordData).reduce((acc, key) => {
            acc[FilesAttributes[key]] =
                typeof recordData[key] === 'object' ? JSON.stringify(recordData[key]) : recordData[key];
            return acc;
        }, {});
        dataToSave.id = newRecord.id;

        try {
            await deps.recordDomain.updateRecord({
                library,
                recordData: dataToSave,
                ctx
            });
        } catch (e) {
            deps.logger.warn(`[FilesManager] Error when saving values for new record : ${newRecord.id}`, e.message);
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
        recordRepo: IRecordRepo;
        updateRecordLastModif: UpdateRecordLastModifFunc;
        config: Config.IConfig;
        logger: winston.Winston;
    },
    ctx: IQueryInfos
) => {
    // Update record file attributes
    const dataToSave: IRecord = Object.keys(recordData).reduce((acc, key) => {
        acc[FilesAttributes[key]] = recordData[key];
        return acc;
    }, {});
    dataToSave.id = recordId;

    try {
        await deps.recordRepo.updateRecord({
            libraryId: library,
            recordData: dataToSave,
            ctx
        });

        await updateRecordLastModif(library, recordId, deps, ctx);
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

export const getPreviewsDefaultData = (previewVersions: IPreviewVersion[]) => {
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
