import {type UpdateRecordLastModifFunc} from '../../../helpers/updateRecordLastModif';
import {type ILibraryDomain} from '../../../library/libraryDomain';
import {type SendRecordUpdateEventHelper} from '../../../record/helpers/sendRecordUpdateEvent';
import {type IRecordDomain} from '../../../record/recordDomain';
import {type ITreeDomain} from '../../../tree/treeDomain';
import {type IValueDomain} from '../../../value/valueDomain';
import {type IFilesManagerRabbitMQ} from '../../../../infra/filesManager/filesManagerRabbitMQ';
import {type IFilesManagerRepo} from '../../../../infra/filesManager/filesManagerRepo';
import {type IRecordRepo} from '../../../../infra/record/recordRepo';
import {type IUtils} from '../../../../utils/utils';
import {type ILogger} from '@leav/logger';
import {type IConfig} from '../../../../_types/config';
import {type IFileEventData} from '../../../../_types/filesManager';
import {type IQueryInfos} from '../../../../_types/queryInfos';

export interface IHandleFileSystemEventDeps {
    libraryDomain: ILibraryDomain;
    recordDomain: IRecordDomain;
    valueDomain: IValueDomain;
    treeDomain: ITreeDomain;
    recordRepo: IRecordRepo;
    filesManagerRabbitMQ: IFilesManagerRabbitMQ;
    updateRecordLastModif: UpdateRecordLastModifFunc;
    logger: ILogger;
    config: IConfig;
    utils: IUtils;
    filesManagerRepo: IFilesManagerRepo;
    sendRecordUpdateEvent: SendRecordUpdateEventHelper;
}

export interface IHandleFileSystemEventResources {
    library: string;
}

export type HandleFileSystemEventFunc = (
    scanMsg: IFileEventData,
    resources: IHandleFileSystemEventResources,
    ctx: IQueryInfos,
) => Promise<void>;
