// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {IRecord} from '_types/record';
import {aql, join} from 'arangojs/aql';
import {IDbDocument} from 'infra/db/_types';
import {IDbService} from 'infra/db/dbService';
import {IDbUtils} from 'infra/db/dbUtils';
import {join as joinPath} from 'path';
import winston from 'winston';
import {FilesAttributes} from '../../_types/filesManager';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.utils.logger'?: winston.Winston;
}

export interface IFilesManagerRepo {
    getRecord(
        {fileName, filePath, fileInode}: {fileName: string; filePath: string; fileInode?: number},
        {recordLibrary, recordId}: {recordLibrary: string; recordId?: string},
        retrieveInactive: boolean,
        ctx: IQueryInfos
    ): Promise<IRecord | null>;
    getParentRecord(fullParentPath: string, library: string, ctx: IQueryInfos): Promise<IRecord | null>;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.utils.logger': logger = null
}: IDeps): IFilesManagerRepo {
    return {
        async getRecord(
            {fileName, filePath, fileInode}: {fileName: string; filePath: string; fileInode?: number},
            {recordLibrary, recordId}: {recordLibrary: string; recordId?: string},
            retrieveInactive: boolean,
            ctx: IQueryInfos
        ): Promise<IRecord | null> {
            const coll = dbService.db.collection(recordLibrary);

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
            const query = join(queryParts, '\n');

            try {
                results = await dbService.execute({
                    query,
                    withTotalCount: false,
                    ctx
                });
            } catch (e) {
                return null;
            }

            const count = results.length;
            if (count === 0) {
                return null;
            }

            if (count > 1) {
                logger.warn(`[FilesManager] Multiple record found using fileName and filePath: ${results.toString()}`);
            }

            return dbUtils.cleanup(results[0]);
        },
        async getParentRecord(fullParentPath: string, library: string, ctx: IQueryInfos): Promise<IRecord | null> {
            let parentPath = fullParentPath.split('/');
            const parentName = parentPath.pop();

            if (parentPath.length === 0) {
                parentPath = ['.'];
            }

            const coll = dbService.db.collection(library);
            const query = aql`FOR r in ${coll} FILTER (r.${FilesAttributes.FILE_NAME} == ${parentName} AND r.${
                FilesAttributes.FILE_PATH
            } == ${joinPath(...parentPath)}) RETURN MERGE(r, {library: ${library}})`;
            let results: IDbDocument[];
            try {
                results = await dbService.execute({
                    query,
                    withTotalCount: false,
                    ctx
                });
            } catch (e) {
                logger.warn(`[FilesManager] Error when search parent folder : ${fullParentPath}`);
                return null;
            }

            const parent = results[0] ? dbUtils.cleanup(results[0]) : null;

            return parent;
        }
    };
}
