import * as Joi from '@hapi/joi';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IAmqpManager} from 'infra/amqpManager/amqpManager';
import {IUtils} from 'utils/utils';
import winston from 'winston';
import * as Config from '_types/config';
import {ISystemTranslation} from '_types/systemTranslation';
import {RoutingKeys} from '../../_types/amqp';
import {AttributeFormats, IEmbeddedAttribute} from '../../_types/attribute';
import {FileEvents, FilesAttributes, IFileEventData, IPreviewVersion} from '../../_types/filesManager';
import {IRecordDomain} from './../record/recordDomain';
import {handleEventFileSystem} from './helpers/handleFileSystem';
import {handlePreviewResponse} from './helpers/handlePreviewResponse';

interface IPreviewAttributesSettings {
    [FilesAttributes.PREVIEWS]: IEmbeddedAttribute[];
    [FilesAttributes.PREVIEWS_STATUS]: IEmbeddedAttribute[];
}

export interface IFilesManagerDomain {
    init(): Promise<void>;
    getPreviewVersion(): IPreviewVersion[];
    getPreviewAttributesSettings(): IPreviewAttributesSettings;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqpManager'?: IAmqpManager;
    'core.utils.logger'?: winston.Winston;
    'core.domain.record'?: IRecordDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.utils'?: IUtils;
}

const systemPreviewVersions: IPreviewVersion[] = [
    {
        background: false,
        density: 300,
        sizes: [
            {
                size: 32,
                name: 'small'
            },
            {
                size: 256,
                name: 'medium'
            },
            {
                size: 1024,
                name: 'big'
            }
        ]
    }
];

const getLibrary = (rootKey: string) => {
    // rootKey => library
    const cache = {
        files1: 'files'
    };

    return cache[rootKey];
};

export default function({
    config = null,
    'core.infra.amqpManager': amqpManager = null,
    'core.utils.logger': logger = null,
    'core.domain.record': recordDomain = null,
    'core.domain.value': valueDomain = null,
    'core.domain.tree': treeDomain = null,
    'core.utils': utils = null
}: IDeps): IFilesManagerDomain {
    const _onMessage = async (msg: string): Promise<void> => {
        let msgBody: IFileEventData;

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
            const library = getLibrary(msgBody.rootKey);
            await handleEventFileSystem(
                msgBody,
                {library},
                {
                    recordDomain,
                    valueDomain,
                    treeDomain,
                    amqpManager,
                    previewVersions: systemPreviewVersions,
                    logger,
                    config,
                    utils
                }
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
                .equal(Object.keys(FileEvents))
                .required(),
            time: Joi.number().required(),
            pathBefore: Joi.string().allow(null),
            pathAfter: Joi.string().allow(null),
            inode: Joi.number().required(),
            rootKey: Joi.string().required(),
            isDirectory: Joi.boolean().required()
        });

        const isValid = msgBodySchema.validate(msg);

        if (isValid.error !== null) {
            const errorMsg = isValid.error.details.map(e => e.message).join(', ');
            throw new Error(errorMsg);
        }
    };

    return {
        async init(): Promise<void> {
            await handlePreviewResponse(amqpManager, config, logger, {
                recordDomain,
                valueDomain,
                previewVersions: systemPreviewVersions,
                config,
                logger
            });
            return amqpManager.consume(
                config.filesManager.queues.filesEvents,
                RoutingKeys.FILES_EVENT,
                _onMessage,
                config.filesManager.prefetch
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
                {[FilesAttributes.PREVIEWS]: [], [FilesAttributes.PREVIEWS_STATUS]: []}
            );
        }
    };
}
