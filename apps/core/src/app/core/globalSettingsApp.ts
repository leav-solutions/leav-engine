// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {appRootPath} from '@leav/app-root-path';
import {InitQueryContextFunc} from 'app/helpers/initQueryContext';
import {IRecordDomain} from 'domain/record/recordDomain';
import {Express, NextFunction, Response} from 'express';
import path from 'node:path';
import winston from 'winston';
import {IConfig} from '_types/config';
import {IRequestWithContext} from '_types/express';
import {IGlobalSettings} from '_types/globalSettings';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import {IAppModule} from '_types/shared';
import {IGlobalSettingsDomain} from '../../domain/globalSettings/globalSettingsDomain';
import {APP_DEFAULT_NAME} from '../../_constants/globalSettings';
import {AttributeCondition} from '../../_types/record';

export interface ICoreApp extends IAppModule {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
    registerRoute(app: Express): void;
}

interface IDeps {
    'core.app.helpers.initQueryContext'?: InitQueryContextFunc;
    'core.domain.globalSettings'?: IGlobalSettingsDomain;
    'core.domain.record'?: IRecordDomain;
    'core.utils.logger'?: winston.Winston;
    config: IConfig;
}

export default function ({
    'core.app.helpers.initQueryContext': initQueryContext = null,
    'core.domain.globalSettings': globalSettingsDomain = null,
    'core.domain.record': recordDomain = null,
    'core.utils.logger': logger = null,
    config = null
}: IDeps): ICoreApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type GlobalSettings {
                        name: String!,
                        icon: Record
                    }

                    input GlobalSettingsIconInput {
                        library: String!,
                        recordId: String!
                    }

                    input GlobalSettingsInput {
                        name: String,
                        icon: GlobalSettingsIconInput
                    }

                    extend type Query {
                        globalSettings: GlobalSettings!
                    }

                    extend type Mutation {
                        saveGlobalSettings(settings: GlobalSettingsInput): GlobalSettings!
                    }
                `,
                resolvers: {
                    GlobalSettings: {
                        name: async (settings: IGlobalSettings) => {
                            if (!settings.name) {
                                return APP_DEFAULT_NAME;
                            }

                            return settings.name;
                        },
                        icon: async (settings: IGlobalSettings, _, ctx: IQueryInfos) => {
                            if (!settings.icon) {
                                return null;
                            }

                            const record = await recordDomain.find({
                                params: {
                                    library: settings.icon.library,
                                    filters: [
                                        {
                                            field: 'id',
                                            value: settings.icon.recordId,
                                            condition: AttributeCondition.EQUAL
                                        }
                                    ]
                                },
                                ctx
                            });

                            return record.list.length ? record.list[0] : null;
                        }
                    },
                    Query: {
                        globalSettings: async (_, args, ctx: IQueryInfos) => {
                            const settings = await globalSettingsDomain.getSettings(ctx);

                            return settings;
                        }
                    },
                    Mutation: {
                        saveGlobalSettings: (_, {settings}: {settings: IGlobalSettings}, ctx: IQueryInfos) =>
                            globalSettingsDomain.saveSettings({settings, ctx})
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
        registerRoute(app): void {
            const _initCtx = async (req: IRequestWithContext, res, next) => {
                req.ctx = initQueryContext(req);

                req.ctx.userId = config.defaultUserId;
                req.ctx.groupsId = [];
                return next();
            };

            const _handleError = async (err, req, res, next) => {
                logger.error(`[${req.ctx.queryId}] ${err}`);
                logger.error(err.stack);
                res.status(err.statusCode ?? 500).send(err.type ?? 'Internal server error');
            };

            const _serveDefaultIcon = async (req: IRequestWithContext, res: Response, next: NextFunction) => {
                const rootPath = appRootPath();
                const defaultIconPath = path.resolve(rootPath, '../../assets/logo-leavengine.svg');
                res.sendFile(defaultIconPath);
            };

            app.get(
                '/global-name',
                _initCtx,
                async (req: IRequestWithContext, res: Response, next: NextFunction) => {
                    try {
                        const settings = await globalSettingsDomain.getSettings(req.ctx);

                        return res.status(200).send(settings.name || APP_DEFAULT_NAME);
                    } catch (err) {
                        return next(err);
                    }
                },
                _handleError
            );

            app.get(
                '/global-lang',
                _initCtx,
                async (req: IRequestWithContext, res: Response, next: NextFunction) => {
                    try {
                        return res.status(200).send(config.lang.default);
                    } catch (err) {
                        return next(err);
                    }
                },
                _handleError
            );

            app.get(
                '/global-icon/:size',
                _initCtx,
                async (req: IRequestWithContext, res: Response, next: NextFunction) => {
                    try {
                        const settings = await globalSettingsDomain.getSettings(req.ctx);

                        if (!settings.icon) {
                            _serveDefaultIcon(req, res, next);
                            return;
                        }

                        const fileRecord = (
                            await recordDomain.find({
                                params: {
                                    library: settings.icon.library,
                                    filters: [
                                        {
                                            field: 'id',
                                            value: settings.icon.recordId,
                                            condition: AttributeCondition.EQUAL
                                        }
                                    ]
                                },
                                ctx: req.ctx
                            })
                        ).list[0];

                        if (!fileRecord) {
                            _serveDefaultIcon(req, res, next);
                            return;
                        }

                        let previewPath = fileRecord.previews[req.params.size];
                        // Remove leading slash of previewPath
                        if (previewPath.startsWith('/')) {
                            previewPath = previewPath.slice(1);
                        }

                        const filePath = path.resolve(config.preview.directory, previewPath);

                        // Cache TTL is 1 day
                        res.set('Cache-Control', 'public, max-age=86400');
                        res.sendFile(filePath);
                    } catch (err) {
                        return next(err);
                    }
                },
                _handleError
            );
        }
    };
}
