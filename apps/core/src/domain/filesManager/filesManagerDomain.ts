// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IAmqpService} from 'infra/amqp/amqpService';
import Joi from 'joi';
import {IUtils} from 'utils/utils';
import {v4 as uuidv4} from 'uuid';
import winston from 'winston';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {ISystemTranslation} from '_types/systemTranslation';
import {ITreeNode} from '_types/tree';
import {AttributeFormats, IEmbeddedAttribute} from '../../_types/attribute';
import {FileEvents, FilesAttributes, IFileEventData, IPreviewVersion} from '../../_types/filesManager';
import {AttributeCondition, IRecord} from '../../_types/record';
import {IRecordDomain} from '../record/recordDomain';
import {handleEventFileSystem} from './helpers/handleFileSystem';
import {createPreview} from './helpers/handlePreview';
import {handlePreviewResponse} from './helpers/handlePreviewResponse';

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

export interface IFilesManagerDomain {
    init(): Promise<void>;
    getPreviewVersion(): IPreviewVersion[];
    getPreviewAttributesSettings(): IPreviewAttributesSettings;
    forcePreviewsGeneration(params: IForcePreviewsGenerationParams): Promise<boolean>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqp.amqpService'?: IAmqpService;
    'core.utils.logger'?: winston.Winston;
    'core.domain.record'?: IRecordDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.utils'?: IUtils;
}

export const systemPreviewVersions: IPreviewVersion[] = [
    {
        background: false,
        density: 300,
        sizes: [
            {
                size: 64,
                name: 'tiny'
            },
            {
                size: 128,
                name: 'small'
            },
            {
                size: 256,
                name: 'medium'
            },
            {
                size: 512,
                name: 'big'
            },
            {
                size: 1024,
                name: 'huge'
            }
        ]
    }
];

export default function ({
    config = null,
    'core.infra.amqp.amqpService': amqpService = null,
    'core.utils.logger': logger = null,
    'core.domain.record': recordDomain = null,
    'core.domain.value': valueDomain = null,
    'core.domain.tree': treeDomain = null,
    'core.utils': utils = null
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

        try {
            const library = config.filesManager.rootKeys[msgBody.rootKey];
            await handleEventFileSystem(
                msgBody,
                {library},
                {
                    recordDomain,
                    valueDomain,
                    treeDomain,
                    amqpService,
                    previewVersions: systemPreviewVersions,
                    logger,
                    config,
                    utils
                },
                ctx
            );
        } catch (e) {
            logger.error(
                `[FilesManager] Error when processing file event msg:
                    ${e.message}.
                    Message was: ${msg}
                `
            );
        }
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
            hash: Joi.string()
        });

        const isValid = msgBodySchema.validate(msg);

        if (!!isValid.error) {
            const errorMsg = isValid.error.details.map(e => e.message).join(', ');
            throw new Error(errorMsg);
        }
    };

    return {
        async init(): Promise<void> {
            await amqpService.amqp.consumer.channel.assertQueue(config.filesManager.queues.events);
            await amqpService.amqp.consumer.channel.bindQueue(
                config.filesManager.queues.events,
                config.amqp.exchange,
                config.filesManager.routingKeys.events
            );

            await handlePreviewResponse(config, logger, {
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

            const versions = systemPreviewVersions;

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

            // if recordId is a directory: recreate all previews of subfiles
            if (records.length === 1 && records[0][FilesAttributes.IS_DIRECTORY]) {
                const treeId = utils.getLibraryTreeId(libraryId);
                const treeNodes = await treeDomain.getNodesByRecord({
                    treeId,
                    record: {id: records[0].id, library: libraryId},
                    ctx
                });

                const nodes: ITreeNode[] = await treeDomain.getTreeContent({
                    treeId,
                    startingNode: treeNodes[0], // Process only first node, as a record in file tree shouldn't be at multiple places
                    ctx
                });

                records = _getChildren(nodes);
            }

            // del all directories records
            records = records.filter(r => !r[FilesAttributes.IS_DIRECTORY]);

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
                        libraryId,
                        systemPreviewVersions,
                        amqpService,
                        config
                    );
                }
            }

            return true;
        }
    };
}
