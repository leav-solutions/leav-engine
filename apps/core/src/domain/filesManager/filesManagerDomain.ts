// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {i18n} from 'i18next';
import Joi from 'joi';
import {IUtils} from 'utils/utils';
import {v4 as uuidv4} from 'uuid';
import winston from 'winston';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {ISystemTranslation} from '_types/systemTranslation';
import {ITreeNode} from '_types/tree';
import ValidationError from '../../errors/ValidationError';
import {AttributeFormats, IEmbeddedAttribute} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {FileEvents, FilesAttributes, IFileEventData, IPreviewVersion} from '../../_types/filesManager';
import {LibraryBehavior} from '../../_types/library';
import {AttributeCondition, IRecord} from '../../_types/record';
import {IRecordDomain} from '../record/recordDomain';
import {createPreview} from './helpers/handlePreview';
import {initPreviewResponseHandler} from './helpers/handlePreviewResponse';
import {IMessagesHandlerHelper} from './helpers/messagesHandler/messagesHandler';
import {systemPreviewVersions} from './_constants';

interface IPreviewAttributesSettings {
    [FilesAttributes.PREVIEWS]: IEmbeddedAttribute[];
    [FilesAttributes.PREVIEWS_STATUS]: IEmbeddedAttribute[];
}

interface IForcePreviewsGenerationParams {
    ctx: IQueryInfos;
    libraryId: string;
    failedOnly?: boolean;
    recordId?: string;
}

interface IGetOriginalPathParams {
    fileId: string;
    libraryId: string;
    ctx: IQueryInfos;
}

export interface IFilesManagerDomain {
    init(): Promise<void>;
    getPreviewVersion(): IPreviewVersion[];
    getPreviewAttributesSettings(): IPreviewAttributesSettings;
    forcePreviewsGeneration(params: IForcePreviewsGenerationParams): Promise<boolean>;
    getRootPathByKey(rootKey: string): string;
    getOriginalPath(params: IGetOriginalPathParams): Promise<string>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqpService'?: IAmqpService;
    'core.utils.logger'?: winston.Winston;
    'core.domain.record'?: IRecordDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.domain.filesManager.helpers.messagesHandler'?: IMessagesHandlerHelper;
    'core.domain.library'?: ILibraryDomain;
    'core.utils'?: IUtils;
    translator?: i18n;
}

export default function ({
    config = null,
    'core.infra.amqpService': amqpService = null,
    'core.utils.logger': logger = null,
    'core.domain.record': recordDomain = null,
    'core.domain.value': valueDomain = null,
    'core.domain.tree': treeDomain = null,
    'core.domain.filesManager.helpers.messagesHandler': messagesHandler = null,
    'core.domain.library': libraryDomain = null,
    'core.utils': utils = null,
    translator = null
}: IDeps): IFilesManagerDomain {
    const _onMessage = async (msg: string): Promise<void> => {
        let msgBody: IFileEventData;
        const ctx: IQueryInfos = {
            userId: config.filesManager.userId,
            queryId: uuidv4()
        };
        try {
            msgBody = JSON.parse(msg);
            _validateMsg(msgBody);
        } catch (e) {
            logger.error(
                `[FilesManager] Invalid message:
                ${e.message}.
                Message was: ${msg}
                `
            );

            return;
        }

        messagesHandler.handleMessage(msgBody, ctx);
    };

    const _validateMsg = (msg: IFileEventData): void => {
        const msgBodySchema = Joi.object().keys({
            event: Joi.string()
                .equal(...Object.keys(FileEvents))
                .required(),
            time: Joi.number().required(),
            pathBefore: Joi.string().allow(null),
            pathAfter: Joi.string().allow(null),
            inode: Joi.number().required(),
            rootKey: Joi.string().required(),
            isDirectory: Joi.boolean().required(),
            hash: Joi.string(),
            recordId: Joi.string()
        });

        const isValid = msgBodySchema.validate(msg);

        if (!!isValid.error) {
            const errorMsg = isValid.error.details.map(e => e.message).join(', ');
            throw new Error(errorMsg);
        }
    };

    return {
        async init(): Promise<void> {
            await amqpService.consumer.channel.assertQueue(config.filesManager.queues.events);
            await amqpService.consumer.channel.bindQueue(
                config.filesManager.queues.events,
                config.amqp.exchange,
                config.filesManager.routingKeys.events
            );

            await initPreviewResponseHandler(config, logger, {
                amqpService,
                recordDomain,
                valueDomain,
                previewVersions: systemPreviewVersions,
                config,
                logger
            });

            return amqpService.consume(
                config.filesManager.queues.events,
                config.filesManager.routingKeys.events,
                _onMessage
            );
        },
        getPreviewVersion(): IPreviewVersion[] {
            return systemPreviewVersions;
        },
        getPreviewAttributesSettings(): IPreviewAttributesSettings {
            const _getSizeLabel = (size): ISystemTranslation =>
                config.lang.available.reduce((labels, lang) => {
                    labels[lang] = size.name;
                    return labels;
                }, {});

            const versions = this.getPreviewVersion();

            return versions.reduce(
                (settings: IPreviewAttributesSettings, version) => {
                    const listSizes = [...version.sizes, {name: 'pages', size: 0}];
                    for (const size of listSizes) {
                        settings[FilesAttributes.PREVIEWS].push({
                            id: size.name,
                            label: _getSizeLabel(size),
                            format: AttributeFormats.TEXT
                        });

                        settings[FilesAttributes.PREVIEWS_STATUS].push({
                            id: size.name,
                            label: _getSizeLabel(size),
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: [
                                {
                                    id: 'status',
                                    format: AttributeFormats.NUMERIC
                                },
                                {
                                    id: 'message',
                                    format: AttributeFormats.TEXT
                                }
                            ]
                        });
                    }
                    return settings;
                },
                {
                    [FilesAttributes.PREVIEWS]: [],
                    [FilesAttributes.PREVIEWS_STATUS]: []
                }
            );
        },
        async forcePreviewsGeneration({
            ctx,
            libraryId,
            failedOnly,
            recordId
        }: IForcePreviewsGenerationParams): Promise<boolean> {
            const _getChildren = (nodes: ITreeNode[], records: IRecord[] = []): IRecord[] => {
                for (const n of nodes) {
                    records.push(n.record);

                    if (!!n.children) {
                        records = _getChildren(n.children, records);
                    }
                }

                return records;
            };

            const libraryProps = await libraryDomain.getLibraryProperties(libraryId, ctx);

            if (!recordId && libraryProps.behavior === LibraryBehavior.DIRECTORIES) {
                // Nothing to do if we ask to generate previews for directories
                return false;
            }

            let records = (
                await recordDomain.find({
                    params: {
                        library: libraryId,
                        ...(recordId && {
                            filters: [{field: 'id', value: recordId, condition: AttributeCondition.EQUAL}]
                        })
                    },
                    ctx
                })
            ).list;

            if (!records.length) {
                // No records found, nothing to do
                return false;
            }

            // If recordId is a directory: recreate all previews of subfiles
            if (recordId && libraryProps.behavior === LibraryBehavior.DIRECTORIES) {
                // Find tree where this directory belongs
                const trees = await treeDomain.getTrees({
                    params: {
                        filters: {
                            library: libraryId
                        }
                    },
                    ctx
                });
                const tree = trees.list[0];
                const treeLibraries = await Promise.all(
                    Object.keys(tree.libraries).map(treeLibraryId =>
                        libraryDomain.getLibraryProperties(treeLibraryId, ctx)
                    )
                );
                const filesLibraryId = treeLibraries.find(l => l.behavior === LibraryBehavior.FILES).id;

                if (trees.list.length) {
                    const treeId = tree.id;
                    const treeNodes = await treeDomain.getNodesByRecord({
                        treeId,
                        record: {id: records[0].id, library: libraryId},
                        ctx
                    });

                    // Get children for first node only, as a record in file tree shouldn't be at multiple places
                    const nodes: ITreeNode[] = await treeDomain.getTreeContent({
                        treeId,
                        startingNode: treeNodes[0],
                        ctx
                    });

                    records = _getChildren(nodes);

                    // del all directories records
                    records = records.filter(r => r.library === filesLibraryId);
                }
            }

            for (const r of records) {
                if (
                    !failedOnly ||
                    (failedOnly &&
                        Object.entries(r[FilesAttributes.PREVIEWS_STATUS]).some(
                            p => (p[1] as {status: number; message: string}).status !== 0
                        ))
                ) {
                    await createPreview(
                        r.id,
                        `${r[FilesAttributes.FILE_PATH]}/${r[FilesAttributes.FILE_NAME]}`,
                        r.library,
                        systemPreviewVersions,
                        amqpService,
                        config
                    );
                }
            }

            return true;
        },
        getRootPathByKey(rootKey) {
            const rootPathConfig = config.files.rootPaths;

            // Paths config is in the form of: "key1:path1,key2:path2"
            const pathsByKeys = rootPathConfig.split(',').reduce((paths, pathByKey) => {
                // Trim all the thing to be tolerant with trailing spaces
                const [key, path] = pathByKey.trim().split(':');
                paths[key.trim()] = path.trim();

                return paths;
            }, {});

            if (!pathsByKeys[rootKey]) {
                throw new Error(`Root path for key ${rootKey} not found`);
            }

            return pathsByKeys[rootKey];
        },
        async getOriginalPath({fileId, libraryId, ctx}) {
            // Get file record
            const fileRecords = await recordDomain.find({
                params: {
                    library: libraryId,
                    filters: [{field: 'id', value: fileId, condition: AttributeCondition.EQUAL}]
                },
                ctx
            });

            if (!fileRecords.list.length) {
                throw new ValidationError(
                    {
                        id: Errors.FILE_NOT_FOUND
                    },
                    translator.t('errors.FILE_NOT_FOUND')
                );
            }

            const fileRecord = fileRecords.list[0];

            // Get root path from file root key
            let rootPath = this.getRootPathByKey(fileRecord[FilesAttributes.ROOT_KEY]);

            // Handle famous issue of presence or not of trailing slash in a path
            if (rootPath[rootPath.length - 1] !== '/') {
                rootPath += '/';
            }

            // Return original path
            const fullPath = `${rootPath}${fileRecord[FilesAttributes.FILE_PATH]}/${
                fileRecord[FilesAttributes.FILE_NAME]
            }`;

            // Clean double slashes, just to be sure
            return fullPath.replace('//', '/');
        }
    };
}
