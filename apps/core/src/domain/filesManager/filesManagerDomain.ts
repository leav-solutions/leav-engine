// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import {isFileAllowed, PreviewPriority} from '@leav/utils';
import increment from 'add-filename-increment';
import * as amqp from 'amqplib';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {CreateDirectoryFunc} from 'domain/helpers/createDirectory';
import {StoreUploadFileFunc} from 'domain/helpers/storeUploadFile';
import {UpdateRecordLastModifFunc} from 'domain/helpers/updateRecordLastModif';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {ILibraryPermissionDomain} from 'domain/permission/libraryPermissionDomain';
import {IRecordFilterLight} from 'domain/record/_types';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {FileUpload} from 'graphql-upload';
import {i18n} from 'i18next';
import {IRecordRepo} from 'infra/record/recordRepo';
import Joi from 'joi';
import * as Path from 'path';
import {Progress} from 'progress-stream';
import {IUtils} from 'utils/utils';
import {v4 as uuidv4} from 'uuid';
import winston from 'winston';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {ITreeNode} from '_types/tree';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {USERS_GROUP_LIB_NAME, USERS_GROUP_TREE_NAME} from '../../infra/permission/permissionRepo';
import {Errors} from '../../_types/errors';
import {FileEvents, FilesAttributes, IFileEventData, IFileMetadata} from '../../_types/filesManager';
import {ILibrary, LibraryBehavior} from '../../_types/library';
import {LibraryPermissionsActions} from '../../_types/permissions';
import {AttributeCondition, IRecord, Operator} from '../../_types/record';
import {IRecordDomain} from '../record/recordDomain';
import {getRootPathByKey} from './helpers/getRootPathByKey';
import {getPreviewsDefaultData, updateRecordFile} from './helpers/handleFileUtilsHelper';
import {requestPreviewGeneration} from './helpers/handlePreview';
import {initPreviewResponseHandler} from './helpers/handlePreviewResponse';
import {IMessagesHandlerHelper} from './helpers/messagesHandler/messagesHandler';
import {systemPreviewsSettings} from './_constants';

interface IForcePreviewsGenerationParams {
    ctx: IQueryInfos;
    libraryId: string;
    failedOnly?: boolean;
    recordIds?: string[];
    filters?: IRecordFilterLight[];
}

interface IGetOriginalPathParams {
    fileId: string;
    libraryId: string;
    ctx: IQueryInfos;
}

interface ICreateDirectoryParams {
    library: string;
    nodeId: string;
    name: string;
}

export interface IStoreFilesParams {
    library: string;
    nodeId: string;
    files: Array<{data: FileUpload; uid: string; size?: number; replace?: boolean}>;
}

interface IIsFileExistsAsChild {
    treeId: string;
    parentNodeId: string;
    filename: string;
}

export const TRIGGER_NAME_UPLOAD_FILE = 'UPLOAD_FILE';

export interface IFilesManagerDomain {
    init(): Promise<void>;
    getPreviewVersion(): ILibrary['previewsSettings'];
    forcePreviewsGeneration(params: IForcePreviewsGenerationParams): Promise<boolean>;
    getRootPathByKey(rootKey: string): string;
    getOriginalPath(params: IGetOriginalPathParams): Promise<string>;
    storeFiles(
        {library, nodeId, files}: IStoreFilesParams,
        ctx: IQueryInfos
    ): Promise<Array<{uid: string; record: IRecord}>>;
    createDirectory({library, nodeId, name}: ICreateDirectoryParams, ctx: IQueryInfos): Promise<IRecord>;
    doesFileExistAsChild({treeId, filename, parentNodeId}: IIsFileExistsAsChild, ctx: IQueryInfos): Promise<boolean>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.utils'?: IUtils;
    'core.infra.amqpService'?: IAmqpService;
    'core.utils.logger'?: winston.Winston;
    'core.domain.record'?: IRecordDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.domain.permission.library'?: ILibraryPermissionDomain;
    'core.domain.filesManager.helpers.messagesHandler'?: IMessagesHandlerHelper;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.helpers.updateRecordLastModif'?: UpdateRecordLastModifFunc;
    'core.domain.helpers.storeUploadFile'?: StoreUploadFileFunc;
    'core.domain.helpers.createDirectory'?: CreateDirectoryFunc;
    'core.infra.record'?: IRecordRepo;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    translator?: i18n;
}

export default function ({
    config = null,
    'core.utils': utils = null,
    'core.infra.amqpService': amqpService = null,
    'core.utils.logger': logger = null,
    'core.domain.record': recordDomain = null,
    'core.domain.value': valueDomain = null,
    'core.domain.tree': treeDomain = null,
    'core.domain.permission.library': libraryPermissionDomain = null,
    'core.domain.filesManager.helpers.messagesHandler': messagesHandler = null,
    'core.domain.helpers.storeUploadFile': storeUploadFile = null,
    'core.domain.helpers.createDirectory': createDirectory = null,
    'core.domain.library': libraryDomain = null,
    'core.domain.helpers.updateRecordLastModif': updateRecordLastModif = null,
    'core.domain.eventsManager': eventsManager = null,
    'core.infra.record': recordRepo = null,
    translator = null
}: IDeps): IFilesManagerDomain {
    let _defaultCtx: IQueryInfos;
    const _initDefaultCtx = async () => {
        _defaultCtx = {
            userId: config.filesManager.userId,
            queryId: uuidv4()
        };
        const groupsNodes = (
            await Promise.all(
                config.filesManager.userGroupsIds.split(',').map(groupId =>
                    treeDomain.getNodesByRecord({
                        treeId: USERS_GROUP_TREE_NAME,
                        record: {
                            id: groupId,
                            library: USERS_GROUP_LIB_NAME
                        },
                        ctx: {..._defaultCtx}
                    })
                )
            )
        )[0];
        _defaultCtx.groupsId = groupsNodes;
    };

    const _onMessage = async (msg: amqp.ConsumeMessage): Promise<void> => {
        amqpService.consumer.channel.ack(msg);

        let msgBody: IFileEventData;
        const ctx: IQueryInfos = {
            ..._defaultCtx,
            queryId: uuidv4()
        };

        try {
            msgBody = JSON.parse(msg.content.toString());
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

    const _extractChildrenFromNodes = (nodes: ITreeNode[], records: IRecord[] = []): IRecord[] => {
        for (const n of nodes) {
            records.push(n.record);

            if (!!n.children) {
                records = _extractChildrenFromNodes(n.children, records);
            }
        }

        return records;
    };

    /**
     * Retrieve children nodes for each record
     * To make sure we don't have duplicates, store it on an object */
    const _getAllChildrenRecords = async (
        treeId: string,
        records: IRecord[],
        libraryId: string,
        filesLibraryId: string,
        ctx: IQueryInfos
    ) => {
        return records.reduce(async (promAcc, record): Promise<Record<string, IRecord>> => {
            const acc = await promAcc;
            const treeNodes = await treeDomain.getNodesByRecord({
                treeId,
                record: {id: record.id, library: libraryId},
                ctx
            });

            // Get children for first node only, as a record in file tree shouldn't be at multiple places
            const nodes: ITreeNode[] = await treeDomain.getTreeContent({
                treeId,
                startingNode: treeNodes[0],
                ctx
            });

            const childrenRecords = _extractChildrenFromNodes(nodes);
            for (const childRecord of childrenRecords) {
                // Only keep records from files library (ignore directories)
                if (childRecord.library === filesLibraryId) {
                    acc[childRecord.id] = childRecord;
                }
            }

            return acc;
        }, {});
    };

    const _getSplittedListFiles = (list: string): string[] => list.split(',').filter(p => p);

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
                libraryDomain,
                recordDomain,
                valueDomain,
                recordRepo,
                updateRecordLastModif,
                config,
                logger,
                utils
            });

            await _initDefaultCtx();

            await amqpService.consume(
                config.filesManager.queues.events,
                config.filesManager.routingKeys.events,
                _onMessage
            );

            logger.info('Files Manager is ready. Waiting for messages... 👀');
        },
        async createDirectory({library, nodeId, name}: ICreateDirectoryParams, ctx: IQueryInfos): Promise<IRecord> {
            const filesLibrary = utils.getFilesLibraryId(library);
            const treeId = treeDomain.getLibraryTreeId(filesLibrary, ctx);
            const recordNode = await treeDomain.getRecordByNodeId({treeId, nodeId, ctx});

            // default path is root path
            let path = '.';

            if (!!recordNode) {
                const libProperties = await libraryDomain.getLibraryProperties(recordNode.library, ctx);

                if (libProperties.behavior !== LibraryBehavior.DIRECTORIES) {
                    throw utils.generateExplicitValidationError(
                        'directories',
                        Errors.ONLY_FOLDERS_CAN_BE_SELECTED,
                        ctx.lang
                    );
                }

                path = Path.join(recordNode.file_path, recordNode.file_name);
            }

            // get root key of library from config
            const rootKey = Object.keys(config.filesManager.rootKeys).find(
                key => config.filesManager.rootKeys[key] === filesLibrary
            );

            const rootPath = this.getRootPathByKey(rootKey);
            const fullPath = Path.join(rootPath, path);

            // check if a folder with the same name already exists at this path
            const fileExists = await recordDomain.find({
                params: {
                    library,
                    filters: [
                        {
                            field: FilesAttributes.FILE_NAME,
                            condition: AttributeCondition.EQUAL,
                            value: name
                        },
                        {
                            operator: Operator.AND
                        },
                        {
                            field: FilesAttributes.FILE_PATH,
                            condition: AttributeCondition.EQUAL,
                            value: path
                        }
                    ],
                    withCount: true,
                    retrieveInactive: true
                },
                ctx
            });

            if (fileExists.totalCount) {
                throw utils.generateExplicitValidationError('directories', Errors.DUPLICATE_DIRECTORY_NAMES, ctx.lang);
            }

            const creationRes = await recordDomain.createRecord({library, ctx});

            const systemCtx: IQueryInfos = {
                userId: config.defaultUserId,
                queryId: 'saveValueBatchOnCreatingFolder'
            };

            await recordDomain.updateRecord({
                library,
                recordData: {
                    id: creationRes.record.id,
                    [FilesAttributes.FILE_NAME]: name,
                    [FilesAttributes.FILE_PATH]: path,
                    [FilesAttributes.ROOT_KEY]: rootKey
                },
                ctx: systemCtx
            });

            await createDirectory(name, fullPath, ctx);

            return creationRes.record;
        },
        async storeFiles({library, nodeId, files}: IStoreFilesParams, ctx: IQueryInfos) {
            const filenames: string[] = files.map(f => f.data.filename);

            const treeId = treeDomain.getLibraryTreeId(library, ctx);
            const recordNode = await treeDomain.getRecordByNodeId({treeId, nodeId, ctx});

            // default path is root path
            let path = '.';

            if (!!recordNode) {
                const libProperties = await libraryDomain.getLibraryProperties(recordNode.library, ctx);

                if (libProperties.behavior !== LibraryBehavior.DIRECTORIES) {
                    throw utils.generateExplicitValidationError('files', Errors.ONLY_FOLDERS_CAN_BE_SELECTED, ctx.lang);
                }

                path = Path.join(recordNode.file_path, recordNode.file_name);
            }

            // get root key of library from config
            const rootKey = Object.keys(config.filesManager.rootKeys).find(
                key => config.filesManager.rootKeys[key] === library
            );

            const rootPath = this.getRootPathByKey(rootKey);
            const fullPath = Path.join(rootPath, path);

            // Check if file is allowed according to allow/ignore lists
            const allowList = _getSplittedListFiles(config.filesManager.allowFilesList);
            const ignoreList = _getSplittedListFiles(config.filesManager.ignoreFilesList);

            const forbiddenFiles = filenames.filter(f => {
                const fullFilename = `${fullPath}/${f}`;
                const isAllowed = isFileAllowed(rootPath, allowList, ignoreList, fullFilename);
                return !isAllowed;
            });
            if (forbiddenFiles.length) {
                throw utils.generateExplicitValidationError(
                    'files',
                    {msg: Errors.FORBIDDEN_FILES, vars: {files: forbiddenFiles.join(', ')}},
                    ctx.lang
                );
            }

            // Check if files have the same filename
            if (filenames.filter((f, i) => filenames.indexOf(f) !== i).length) {
                throw utils.generateExplicitValidationError('files', Errors.DUPLICATE_FILENAMES, ctx.lang);
            }

            const records = [];

            for (const file of files) {
                file.replace = file.replace ?? false;

                // check if file already exists
                const fileExists = await recordDomain.find({
                    params: {
                        library,
                        filters: [
                            {
                                field: FilesAttributes.FILE_NAME,
                                condition: AttributeCondition.EQUAL,
                                value: file.data.filename
                            },
                            {
                                operator: Operator.AND
                            },
                            {
                                field: FilesAttributes.FILE_PATH,
                                condition: AttributeCondition.EQUAL,
                                value: path
                            }
                        ],
                        withCount: true,
                        retrieveInactive: true
                    },
                    ctx
                });

                let record;

                if (fileExists.totalCount && file.replace) {
                    const canEdit = await libraryPermissionDomain.getLibraryPermission({
                        action: LibraryPermissionsActions.EDIT_RECORD,
                        userId: ctx.userId,
                        libraryId: library,
                        ctx
                    });

                    if (!canEdit) {
                        throw new PermissionError(LibraryPermissionsActions.EDIT_RECORD);
                    }

                    record = fileExists.list[0];
                } else {
                    const createRecordResult = await recordDomain.createRecord({library, ctx});
                    record = createRecordResult.record;

                    // if file already exists, we modify the filename
                    if (fileExists.totalCount && !file.replace) {
                        const newPath = increment.path(`${fullPath}/${file.data.filename}`, {
                            fs: true,
                            platform: 'darwin'
                        });

                        file.data.filename = newPath.split('/').pop();
                    }

                    const systemCtx: IQueryInfos = {
                        userId: config.defaultUserId,
                        queryId: 'saveValueBatchOnStoringFiles'
                    };

                    await recordDomain.updateRecord({
                        library,
                        recordData: {
                            id: record.id,
                            [FilesAttributes.FILE_NAME]: file.data.filename,
                            [FilesAttributes.FILE_PATH]: path,
                            [FilesAttributes.ROOT_KEY]: rootKey
                        },
                        ctx: systemCtx
                    });
                }

                const getProgress = async (progress: Progress) => {
                    // Round all progress values to have integers
                    Object.keys(progress).forEach(key => {
                        progress[key] = Math.floor(progress[key]);
                    });

                    await eventsManager.sendPubSubEvent(
                        {
                            triggerName: TRIGGER_NAME_UPLOAD_FILE,
                            data: {upload: {uid: file.uid, userId: ctx.userId, progress}}
                        },
                        ctx
                    );
                };

                await storeUploadFile(file.data, fullPath, getProgress, file.size);

                records.push({uid: file.uid, record});
            }

            return records;
        },
        getPreviewVersion() {
            return systemPreviewsSettings;
        },
        async forcePreviewsGeneration({
            ctx,
            libraryId,
            failedOnly,
            filters,
            recordIds = []
        }: IForcePreviewsGenerationParams): Promise<boolean> {
            const libraryProps = await libraryDomain.getLibraryProperties(libraryId, ctx);

            if (!recordIds.length && !filters && libraryProps.behavior === LibraryBehavior.DIRECTORIES) {
                // Nothing to do if we ask to generate previews for directories
                return false;
            }

            // If we have both filters and recordIds, ignore filters
            const recordsFilters =
                filters && !recordIds.length
                    ? filters
                    : recordIds.reduce((allFilters, recordId, index) => {
                          allFilters.push({
                              field: 'id',
                              value: recordId,
                              condition: AttributeCondition.EQUAL
                          });

                          if (index !== recordIds.length - 1) {
                              allFilters.push({
                                  operator: Operator.OR
                              });
                          }

                          return allFilters;
                      }, []);

            const records = (await recordDomain.find({params: {library: libraryId, filters: recordsFilters}, ctx}))
                .list;

            if (!records.length) {
                // No records found, nothing to do
                return false;
            }

            // If library is a directory library: recreate all previews of subfiles
            let recordsToProcess: IRecord[];
            let filesLibraryProps;
            if (libraryProps.behavior === LibraryBehavior.DIRECTORIES) {
                // Find tree where this directory belongs
                const trees = await treeDomain.getTrees({params: {filters: {library: libraryId}}, ctx});

                const tree = trees.list[0];
                const treeLibraries = await Promise.all(
                    Object.keys(tree.libraries).map(treeLibraryId =>
                        libraryDomain.getLibraryProperties(treeLibraryId, ctx)
                    )
                );
                const filesLibraryId = treeLibraries.find(l => l.behavior === LibraryBehavior.FILES).id;
                filesLibraryProps = await libraryDomain.getLibraryProperties(filesLibraryId, ctx);

                if (trees.list.length) {
                    const treeId = tree.id;

                    const recordsById = await _getAllChildrenRecords(treeId, records, libraryId, filesLibraryId, ctx);

                    recordsToProcess = Object.values(recordsById);
                }
            } else {
                recordsToProcess = records;
                filesLibraryProps = libraryProps;
            }

            let generationRequested = 0;

            for (const r of recordsToProcess) {
                if (
                    !failedOnly ||
                    (failedOnly &&
                        Object.entries(r[utils.getPreviewsStatusAttributeName(libraryProps.id)]).some(
                            p => (p[1] as {status: number; message: string}).status !== 0
                        ))
                ) {
                    const {previewsStatus, previews} = getPreviewsDefaultData(systemPreviewsSettings);
                    const recordData: IFileMetadata = {
                        [utils.getPreviewsStatusAttributeName(libraryProps.id)]: previewsStatus,
                        [utils.getPreviewsAttributeName(libraryProps.id)]: previews
                    };
                    await updateRecordFile(
                        recordData,
                        r.id,
                        libraryId,
                        {
                            recordRepo,
                            updateRecordLastModif,
                            valueDomain,
                            config,
                            logger
                        },
                        ctx
                    );

                    await requestPreviewGeneration({
                        recordId: r.id,
                        pathAfter: `${r[FilesAttributes.FILE_PATH]}/${r[FilesAttributes.FILE_NAME]}`,
                        libraryId: r.library,
                        priority: PreviewPriority.MEDIUM,
                        versions: utils.previewsSettingsToVersions(filesLibraryProps.previewsSettings),
                        deps: {amqpService, config, logger}
                    });
                    generationRequested++;
                }
            }

            return generationRequested > 0;
        },
        getRootPathByKey(rootKey) {
            return getRootPathByKey(rootKey, config);
        },
        async doesFileExistAsChild(
            {treeId, filename, parentNodeId}: IIsFileExistsAsChild,
            ctx: IQueryInfos
        ): Promise<boolean> {
            const nodes = await treeDomain.getElementChildren({treeId, nodeId: parentNodeId, ctx});

            return nodes.list.findIndex(n => n.record[FilesAttributes.FILE_NAME] === filename) !== -1;
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
