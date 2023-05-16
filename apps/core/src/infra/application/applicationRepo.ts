// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {aql} from 'arangojs';
import fs, {readdir} from 'fs/promises';
import path from 'path';
import winston from 'winston';
import {IConfig} from '_types/config';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IApplication, IApplicationModule} from '../../_types/application';
import {IGetCoreEntitiesParams} from '../../_types/shared';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';

export interface IApplicationRepo {
    getApplications(params: {params?: IGetCoreEntitiesParams; ctx: IQueryInfos}): Promise<IList<IApplication>>;
    updateApplication(params: {applicationData: IApplication; ctx: IQueryInfos}): Promise<IApplication>;
    createApplication(params: {applicationData: IApplication; ctx: IQueryInfos}): Promise<IApplication>;
    deleteApplication(params: {id: string; ctx: IQueryInfos}): Promise<IApplication>;
    getAvailableModules(params: {ctx: IQueryInfos}): Promise<IApplicationModule[]>;
}

export const APPLICATIONS_COLLECTION_NAME = 'core_applications';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.utils.logger'?: winston.Winston;
    config?: IConfig;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.utils.logger': logger = null,
    config = null
}: IDeps = {}): IApplicationRepo {
    return {
        async getApplications({params, ctx}): Promise<IList<IApplication>> {
            const defaultParams: IGetCoreEntitiesParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null
            };

            const initializedParams = {...defaultParams, ...params};

            return dbUtils.findCoreEntity<IApplication>({
                ...initializedParams,
                collectionName: APPLICATIONS_COLLECTION_NAME,
                nonStrictFields: ['label', 'id', 'endpoint'],
                ctx
            });
        },
        async updateApplication({applicationData, ctx}): Promise<IApplication> {
            const docToInsert = dbUtils.convertToDoc(applicationData);

            const col = dbService.db.collection(APPLICATIONS_COLLECTION_NAME);
            const res = await dbService.execute({
                query: aql`UPDATE ${docToInsert} IN ${col} OPTIONS { mergeObjects: false } RETURN NEW`,
                ctx
            });

            return dbUtils.cleanup(res.pop());
        },
        async createApplication({applicationData, ctx}): Promise<IApplication> {
            const docToInsert = dbUtils.convertToDoc(applicationData);
            // Insert in applications collection
            const col = dbService.db.collection(APPLICATIONS_COLLECTION_NAME);
            const res = await dbService.execute({
                query: aql`INSERT ${docToInsert} IN ${col} RETURN NEW`,
                ctx
            });

            return dbUtils.cleanup(res.pop());
        },
        async deleteApplication({id, ctx}): Promise<IApplication> {
            // Delete attribute
            const col = dbService.db.collection(APPLICATIONS_COLLECTION_NAME);

            const res = await dbService.execute({
                query: aql`REMOVE ${{_key: id}} IN ${col} RETURN OLD`,
                ctx
            });

            // Return deleted attribute
            return dbUtils.cleanup(res.pop());
        },
        async getAvailableModules(): Promise<IApplicationModule[]> {
            const rootPath = appRootPath();
            const appRootFolder = path.resolve(rootPath, config.applications.rootFolder);

            let appsFolders = await readdir(appRootFolder);
            appsFolders = appsFolders.filter(item => !/(^|\/)\.[^\/\.]/g.test(item)); // ignore hidden files

            const components: IApplicationModule[] = await appsFolders.reduce(async (accProm, appFolder) => {
                const acc = await accProm;
                const appPath = path.resolve(appRootFolder, appFolder);
                const manifestPath = path.resolve(appPath, 'manifest.json');

                // Check if manifest file exists. If not, just ignore the folder
                try {
                    await fs.stat(manifestPath);
                } catch (e) {
                    logger.warn(`Manifest file not found for module "${appPath}"`);
                    return acc;
                }

                const appManifestJson = await import(path.resolve(appPath, 'manifest.json'));

                acc.push({
                    id: appManifestJson.name,
                    description: appManifestJson.description,
                    version: appManifestJson.version
                });

                return acc;
            }, Promise.resolve([]));

            return components;
        }
    };
}
