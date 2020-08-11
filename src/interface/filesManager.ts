import {IFilesManagerApp} from 'app/core/filesManagerApp';

export interface IFilesManagerInterface {
    init(): Promise<void>;
}

interface IDeps {
    'core.app.core.filesManager'?: IFilesManagerApp;
}

export default function({'core.app.core.filesManager': filesManager}: IDeps): IFilesManagerInterface {
    return {
        init: () => filesManager.init()
    };
}
