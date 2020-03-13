import {IFilesManagerDomain} from 'domain/filesManager/filesManagerDomain';

export interface IFilesManagerApp {
    init(): Promise<void>;
}

interface IDeps {
    'core.domain.filesManager'?: IFilesManagerDomain;
}

export default function({'core.domain.filesManager': filesManager}: IDeps): IFilesManagerApp {
    return {
        init: () => filesManager.init()
    };
}
